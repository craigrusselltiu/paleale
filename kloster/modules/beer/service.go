package beer

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/config"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/model"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/brewery"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/modelstore"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/untappd"
	"context"
	"fmt"
	"github.com/blevesearch/bleve"
	"go.uber.org/zap"
	"strconv"
	"time"
)

const (
	defaultTimeout = 60 * time.Second
)

type IDAndModel struct {
	ID    id.BeerID   `json:"id"`
	Model *model.Beer `json:"model"`
}

type Service struct {
	config         *config.BeerService
	logger         *zap.Logger
	modelStore     *modelstore.ModelStore
	breweryService *brewery.Service
	untappdService *untappd.Service
	bleve          bleve.Index
}

func NewService(
	config *config.BeerService,
	logger *zap.Logger,
	modelStore *modelstore.ModelStore,
	breweryService *brewery.Service,
	untappdService *untappd.Service,
) (*Service, error) {
	service := &Service{
		config:         config,
		logger:         logger,
		modelStore:     modelStore,
		breweryService: breweryService,
		untappdService: untappdService,
	}

	if err := service.initBleve(); err != nil {
		return nil, err
	}

	if err := service.createUntappdBeerDirectoryIfNotExisted(); err != nil {
		return nil, err
	}

	return service, nil
}

func (s *Service) indexAllBeers(index bleve.Index) error {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	sortKey := ""
	for {
		avs, lastKey, err := s.modelStore.BulkGetWithPartitionKey(ctx, id.BeerIDPrefix, sortKey)
		if err != nil {
			return err
		}

		s.logger.Info(fmt.Sprintf("indexing %d beers...", len(avs)))

		for itemID, av := range avs {
			beer, err := avToBeer(av)
			if err != nil {
				return err
			}
			if err = index.Index(itemID, beer); err != nil {
				return err
			}
		}

		if lastKey == "" {
			break
		}

		sortKey = id.BeerID(lastKey).SortKey()
	}

	return nil
}

func (s *Service) initBleve() error {
	if s.config.BleveIndexPath == "" {
		return nil
	}

	beerIndex, err := bleve.Open(s.config.BleveIndexPath)
	if err == bleve.ErrorIndexPathDoesNotExist {
		s.logger.Info("creating new beers index")

		beerIndex, err = bleve.New(s.config.BleveIndexPath, buildIndexMapping())
		if err != nil {
			return err
		}

		if err = s.indexAllBeers(beerIndex); err != nil {
			return err
		}

		s.logger.Info("finished indexing beers")
	} else if err != nil {
		return err
	} else {
		s.logger.Info(fmt.Sprintf("load beers index from %s", s.config.BleveIndexPath))
	}

	s.bleve = beerIndex

	return nil
}

func (s *Service) createUntappdBeerDirectoryIfNotExisted() error {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	elem := modelstore.Element{
		ID: id.StaticUntappdBeerDirectoryID,
		Value: model.UntappdBeerDirectory{
			UntappdBeerIDs: make(map[string]id.BeerID),
		},
	}

	return s.modelStore.PutIfNotExisted(ctx, &elem)
}

func (s *Service) AddBeer(ctx context.Context, beer *model.Beer) (id.BeerID, error) {
	beerID := id.GenerateBeerID()
	elem := modelstore.Element{
		ID:    beerID,
		Value: beer,
	}

	if err := s.modelStore.Put(ctx, &elem); err != nil {
		return "", err
	}

	go func() {
		if err := s.bleve.Index(beerID.Key(), beer); err != nil {
			s.logger.Error(fmt.Sprintf("cannot index beer %s", beerID.Key()), zap.Error(err))
		}
	}()

	return beerID, nil
}

func (s *Service) BulkGetBeerByIDs(ctx context.Context, beerIDs []id.BeerID) (map[id.BeerID]*model.Beer, error) {
	iIDs := make([]id.ID, len(beerIDs))
	for i := range iIDs {
		iIDs[i] = id.ID(beerIDs[i])
	}
	avs, err := s.modelStore.BulkGet(ctx, iIDs)
	if err != nil {
		return nil, err
	}

	result := make(map[id.BeerID]*model.Beer)
	for iID, av := range avs {
		beer, err := avToBeer(av)
		if err != nil {
			return nil, err
		}
		result[id.BeerID(iID)] = beer
	}

	return result, nil
}

func (s *Service) GetUntappdBeerDirectory(ctx context.Context) (*model.UntappdBeerDirectory, error) {
	av, err := s.modelStore.Get(ctx, id.StaticUntappdBeerDirectoryID)
	if err != nil {
		return nil, err
	}

	return avToUntappdBeerDirectory(av)
}

func (s *Service) UpdateUntappdBeerDirectory(ctx context.Context, directory *model.UntappdBeerDirectory) error {
	elem := modelstore.Element{
		ID:    id.StaticUntappdBeerDirectoryID,
		Value: directory,
	}
	return s.modelStore.Put(ctx, &elem)
}

func (s *Service) BulkAddBeerWithIDs(ctx context.Context, beers []IDAndModel) error {
	elems := make([]modelstore.Element, len(beers))
	for i := range beers {
		elems[i].ID = beers[i].ID
		elems[i].Value = beers[i].Model
	}

	if err := s.modelStore.BulkPut(ctx, elems); err != nil {
		return err
	}

	go func() {
		for i := range beers {
			if err := s.bleve.Index(beers[i].ID.Key(), beers[i].Model); err != nil {
				s.logger.Error(fmt.Sprintf("Cannot index beer %s", beers[i].ID.Key()), zap.Error(err))
			}
		}
	}()

	return nil
}

func (s *Service) SearchBeersDB(ctx context.Context, phrase string, limit int) ([]IDAndModel, error) {
	req := bleve.NewSearchRequestOptions(bleve.NewQueryStringQuery(phrase), limit, 0, false)
	result, err := s.bleve.SearchInContext(ctx, req)
	if err != nil {
		return nil, err
	}

	found := make([]id.BeerID, 0)
	for _, hit := range result.Hits {
		found = append(found, id.BeerID(hit.ID))
	}

	beersMap, err := s.BulkGetBeerByIDs(ctx, found)
	if err != nil {
		return nil, err
	}

	beers := make([]IDAndModel, len(found))
	for i := range found {
		beers[i] = IDAndModel{
			ID:    found[i],
			Model: beersMap[found[i]],
		}
	}

	return beers, nil
}

func (s *Service) SearchBeersUntappd(
	ctx context.Context,
	authStrategy *untappd.AuthStrategy,
	phrase string,
) ([]IDAndModel, error) {
	response, err := s.untappdService.SearchBeers(ctx, authStrategy, phrase, 0, 50, "checkin")
	if err != nil {
		return nil, err
	}

	untappdBeerDirectory, err := s.GetUntappdBeerDirectory(ctx)
	if err != nil {
		return nil, err
	}

	untappdBreweryDirectory, err := s.breweryService.GetUntappdBreweryDirectory(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]IDAndModel, len(response.Beers.Items))

	existedBeers := make([]id.BeerID, 0)
	newBeers := make([]IDAndModel, 0)
	newBreweries := make([]brewery.IDAndModel, 0)

	for i := range response.Beers.Items {
		item := &response.Beers.Items[i]

		untappdBeerID := strconv.FormatInt(item.Beer.ID, 10)

		if beerID, ok := untappdBeerDirectory.UntappdBeerIDs[untappdBeerID]; ok {
			existedBeers = append(existedBeers, beerID)
			result[i].ID = beerID
		} else {
			var breweryID id.BreweryID

			untappdBreweryID := strconv.FormatInt(item.Brewery.ID, 10)

			if breweryID, ok = untappdBreweryDirectory.UntappdBreweryIDs[untappdBreweryID]; !ok {
				breweryID = id.GenerateBreweryID()
				newBreweryIDAndModel := brewery.IDAndModel{
					ID:    breweryID,
					Model: untappdToBreweryModel(&item.Brewery),
				}
				newBreweries = append(newBreweries, newBreweryIDAndModel)
				untappdBreweryDirectory.UntappdBreweryIDs[untappdBreweryID] = breweryID
			}

			beerID = id.GenerateBeerID()
			newBeer := untappdToBeerModel(&item.Beer, breweryID)
			newBeerIDAndModel := IDAndModel{
				ID:    beerID,
				Model: newBeer,
			}
			newBeers = append(newBeers, newBeerIDAndModel)
			untappdBeerDirectory.UntappdBeerIDs[untappdBeerID] = beerID
			result[i] = newBeerIDAndModel
		}
	}

	var getBeersResult map[id.BeerID]*model.Beer
	getBeersResult, err = s.BulkGetBeerByIDs(ctx, existedBeers)
	if err != nil {
		return nil, err
	}

	for i := range result {
		if result[i].Model == nil {
			result[i].Model = getBeersResult[result[i].ID]
		}
	}

	if err = s.breweryService.BulkAddBreweryWithIDs(ctx, newBreweries); err != nil {
		return nil, err
	}

	if err = s.breweryService.UpdateUntappdBreweryDirectory(ctx, untappdBreweryDirectory); err != nil {
		return nil, err
	}

	if err = s.BulkAddBeerWithIDs(ctx, newBeers); err != nil {
		return nil, err
	}

	if err = s.UpdateUntappdBeerDirectory(ctx, untappdBeerDirectory); err != nil {
		return nil, err
	}

	return result, nil
}
