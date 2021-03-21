package brewery

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/model"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/modelstore"
	"context"
	"time"
)

const (
	defaultTimeout = 60 * time.Second
)

type IDAndModel struct {
	ID    id.BreweryID
	Model *model.Brewery
}

type Service struct {
	modelStore *modelstore.ModelStore
}

func NewService(modelStore *modelstore.ModelStore) (*Service, error) {
	service := &Service{
		modelStore: modelStore,
	}

	if err := service.createUntappdBreweryDirectoryIfNotExisted(); err != nil {
		return nil, err
	}

	return service, nil
}

func (s *Service) createUntappdBreweryDirectoryIfNotExisted() error {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	elem := modelstore.Element{
		ID: id.StaticUntappdBreweryDirectoryID,
		Value: &model.UntappdBreweryDirectory{
			UntappdBreweryIDs: make(map[string]id.BreweryID),
		},
	}

	return s.modelStore.PutIfNotExisted(ctx, &elem)
}

func (s *Service) GetUntappdBreweryDirectory(ctx context.Context) (*model.UntappdBreweryDirectory, error) {
	av, err := s.modelStore.Get(ctx, id.StaticUntappdBreweryDirectoryID)
	if err != nil {
		return nil, err
	}

	return avToUntappdBreweryDirectory(av)
}

func (s *Service) UpdateUntappdBreweryDirectory(ctx context.Context, directory *model.UntappdBreweryDirectory) error {
	elem := modelstore.Element{
		ID:    id.StaticUntappdBreweryDirectoryID,
		Value: directory,
	}
	return s.modelStore.Put(ctx, &elem)
}

func (s *Service) BulkAddBreweryWithIDs(ctx context.Context, breweries []IDAndModel) error {
	elems := make([]modelstore.Element, len(breweries))
	for i := range breweries {
		elems[i].ID = breweries[i].ID
		elems[i].Value = breweries[i].Model
	}

	return s.modelStore.BulkPut(ctx, elems)
}

func (s *Service) BulkGetBreweryByIDs(
	ctx context.Context,
	breweryIDs []id.BreweryID,
) (map[id.BreweryID]*model.Brewery, error) {
	itemIDs := make([]id.ID, len(breweryIDs))
	for i := range itemIDs {
		itemIDs[i] = id.ID(breweryIDs[i])
	}

	avs, err := s.modelStore.BulkGet(ctx, itemIDs)
	if err != nil {
		return nil, err
	}

	result := make(map[id.BreweryID]*model.Brewery)
	for itemID, av := range avs {
		brewery, err := avToBrewery(av)
		if err != nil {
			return nil, err
		}
		result[id.BreweryID(itemID)] = brewery
	}

	return result, nil
}
