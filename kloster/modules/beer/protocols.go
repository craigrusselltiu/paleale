package beer

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/model"
)

type addBeerParams struct {
	Beer *model.Beer `json:"beer"`
}

type addBeerResponse struct {
	BeerID id.BeerID `json:"beerID"`
}

type bulkGetBeerByIDsParams struct {
	BeerIDs []id.BeerID `json:"beerIDs"`
}

type bulkGetBeerByIDsResponse struct {
	Beers map[id.BeerID]*model.Beer `json:"beers"`
}

type searchBeersDBParams struct {
	Phrase string `json:"phrase"`
}

type searchBeersDBResponse struct {
	Beers []IDAndModel `json:"beers"`
}

type searchBeersUntappdParams struct {
	Phrase string `json:"phrase"`
}

type searchBeersUntappdResponse struct {
	Beers []IDAndModel `json:"beers"`
}
