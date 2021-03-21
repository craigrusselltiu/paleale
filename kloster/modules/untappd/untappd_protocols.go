package untappd

import (
	"encoding/json"
)

type Metadata struct {
	Code         int    `json:"code"`
	ErrorDetail  string `json:"error_detail"`
	ErrorType    string `json:"error_type"`
	DevFriendly  string `json:"developer_friendly"`
	ResponseTime struct {
		Time    float32 `json:"time"`
		Measure string  `json:"measure"`
	} `json:"response_time"`
}

type rawResponse struct {
	Meta     Metadata        `json:"meta"`
	Response json.RawMessage `json:"response"`
}

type SearchBeersResponse struct {
	Beers struct {
		Count int `json:"count"`
		Items []struct {
			CheckinCount int     `json:"checkin_count"`
			Beer         Beer    `json:"beer"`
			Brewery      Brewery `json:"brewery"`
		} `json:"items"`
	} `json:"beers"`
}

type Beer struct {
	ID             int64   `json:"bid"`
	Name           string  `json:"beer_name"`
	Label          string  `json:"beer_label"`
	ABV            float32 `json:"beer_abv"`
	IBU            int     `json:"beer_ibu"`
	Description    string  `json:"beer_description"`
	IsInProduction int     `json:"in_production"`
	Style          string  `json:"beer_style"`
}

type Brewery struct {
	ID      int64  `json:"brewery_id"`
	Name    string `json:"brewery_name"`
	Label   string `json:"brewery_label"`
	Country string `json:"country_name"`
	Contact struct {
		Twitter   string `json:"twitter"`
		Facebook  string `json:"facebook"`
		Instagram string `json:"instagram"`
		URL       string `json:"url"`
	} `json:"contact"`
	Location struct {
		City      string  `json:"brewery_city"`
		State     string  `json:"brewery_state"`
		Latitude  float64 `json:"lat"`
		Longitude float64 `json:"lng"`
	} `json:"location"`
	IsActive int `json:"brewery_active"`
}
