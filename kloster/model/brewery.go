package model

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
)

type BreweryLocation struct {
	City      string  `json:"city"`
	State     string  `json:"state"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Country   string  `json:"country"`
}

type BreweryContact struct {
	Twitter   string `json:"twitter"`
	Facebook  string `json:"facebook"`
	Instagram string `json:"instagram"`
	URL       string `json:"url"`
}

type Brewery struct {
	Name     string          `json:"name"`
	Label    string          `json:"label"`
	Location BreweryLocation `json:"location"`
	Contact  BreweryContact  `json:"contact"`
	IsActive bool            `json:"isActive"`
}

type UntappdBreweryDirectory struct {
	UntappdBreweryIDs map[string]id.BreweryID `json:"untappdBreweryIDs"`
}
