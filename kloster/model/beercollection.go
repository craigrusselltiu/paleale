package model

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"time"
)

type BeerCollectionItem struct {
	BeerID              id.BeerID `json:"beerID"`
	StorageLocation     string    `json:"storageLocation"`
	PurchasePrice       float64   `json:"purchasePrice"`
	PurchaseDate        time.Time `json:"purchaseDate"`
	PurchaseDistributor string    `json:"purchaseDistributor"`
	BottlesNumber       int       `json:"bottlesNumber"`
	BestBeforeDate			time.Time	`json:"bestBeforeDate"`
}

type BeerCollection struct {
	Name        string               `json:"name"`
	Description string               `json:"description"`
	Tags        []string             `json:"tags"`
	Location    string               `json:"location"`
	Notes       string               `json:"notes"`
	Items       []BeerCollectionItem `json:"items"`
}
