package beercollection

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/model"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/modelstore"
	"context"
)

type Service struct {
	modelStore *modelstore.ModelStore
}

func NewService(modelStore *modelstore.ModelStore) *Service {
	return &Service{
		modelStore: modelStore,
	}
}

func (s *Service) AddBeerCollection(
	ctx context.Context,
	userID id.UserID,
	collection *model.BeerCollection,
) (id.BeerCollectionID, error) {
	collectionID := id.GenerateBeerCollectionID(userID)
	elem := modelstore.Element{
		ID:    collectionID,
		Value: collection,
	}
	if err := s.modelStore.Put(ctx, &elem); err != nil {
		return "", err
	}
	return collectionID, nil
}

func (s *Service) GetBeerCollectionByID(
	ctx context.Context,
	collectionID id.BeerCollectionID,
) (*model.BeerCollection, error) {
	av, err := s.modelStore.Get(ctx, collectionID)
	if err != nil {
		return nil, err
	}
	return avToBeerCollection(av)
}

func (s *Service) BulkGetAllUserBeerCollections(
	ctx context.Context,
	userID id.UserID,
) (map[id.BeerCollectionID]*model.BeerCollection, error) {
	result := make(map[id.BeerCollectionID]*model.BeerCollection)
	partitionKey := id.ConcatID(userID.Key(), id.BeerCollectionIDPrefix)
	sortKey := ""
	for {
		avs, lastKey, err := s.modelStore.BulkGetWithPartitionKey(ctx, partitionKey, sortKey)
		if err != nil {
			return nil, err
		}

		for itemID, av := range avs {
			beerCollection, err := avToBeerCollection(av)
			if err != nil {
				return nil, err
			}

			result[id.BeerCollectionID(itemID)] = beerCollection
		}

		if lastKey == "" {
			break
		}

		sortKey = id.BeerCollectionID(lastKey).SortKey()
	}

	return result, nil
}

func (s *Service) UpdateBeerCollection(
	ctx context.Context,
	collectionID id.BeerCollectionID,
	collection *model.BeerCollection,
) error {
	elem := modelstore.Element{
		ID:    collectionID,
		Value: collection,
	}
	return s.modelStore.Put(ctx, &elem)
}

func (s *Service) DeleteBeerCollection(ctx context.Context, collectionID id.BeerCollectionID) error {
	return s.modelStore.Delete(ctx, collectionID)
}
