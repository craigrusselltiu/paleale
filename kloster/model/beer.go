package model

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
)

type Beer struct {
	Name           string       `json:"name"`
	Label          string       `json:"label"`
	Description    string       `json:"description"`
	BreweryID      id.BreweryID `json:"breweryID"`
	BeerStyle      string       `json:"beerStyle"`
	ABV            float32      `json:"abv"`
	IBU            int          `json:"ibu"`
	IsInProduction bool         `json:"isInProduction"`
}

type UntappdBeerDirectory struct {
	UntappdBeerIDs map[string]id.BeerID `json:"untappdBeerIDs"`
}
