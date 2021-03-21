package beercollection

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/model"
)

type getBeerCollectionByIDParams struct {
	CollectionID id.BeerCollectionID `json:"collectionID"`
}

type getBeerCollectionByIDResponse struct {
	Collection *model.BeerCollection `json:"collection"`
}

type bulkGetAllUserBeerCollectionsResponse struct {
	Collections map[id.BeerCollectionID]*model.BeerCollection `json:"collections"`
}

type addBeerCollectionParams struct {
	Collection *model.BeerCollection `json:"collection"`
}

type addBeerCollectionResponse struct {
	CollectionID id.BeerCollectionID `json:"collectionID"`
}

type updateBeerCollectionParams struct {
	CollectionID id.BeerCollectionID   `json:"collectionID"`
	Collection   *model.BeerCollection `json:"collection"`
}

type deleteBeerCollectionByIDParams struct {
	CollectionID id.BeerCollectionID `json:"collectionID"`
}
