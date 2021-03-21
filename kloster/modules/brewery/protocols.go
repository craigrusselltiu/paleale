package brewery

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/model"
)

type bulkGetBreweryByIDsParams struct {
	BreweryIDs []id.BreweryID `json:"breweryIDs"`
}

type bulkGetBreweryByIDsResponse struct {
	Breweries map[id.BreweryID]*model.Brewery `json:"breweries"`
}
