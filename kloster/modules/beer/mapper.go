package beer

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/model"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/modelstore"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/untappd"
	"github.com/aws/aws-sdk-go/service/dynamodb"
)

func avToBeer(av *dynamodb.AttributeValue) (*model.Beer, error) {
	beer := &model.Beer{}
	if err := modelstore.GlobalDecoder.Decode(av, beer); err != nil {
		return nil, err
	}
	return beer, nil
}

func avToUntappdBeerDirectory(av *dynamodb.AttributeValue) (*model.UntappdBeerDirectory, error) {
	untappdBeerDirectory := &model.UntappdBeerDirectory{}
	if err := modelstore.GlobalDecoder.Decode(av, untappdBeerDirectory); err != nil {
		return nil, err
	}
	if untappdBeerDirectory.UntappdBeerIDs == nil {
		untappdBeerDirectory.UntappdBeerIDs = make(map[string]id.BeerID)
	}
	return untappdBeerDirectory, nil
}

func untappdToBreweryModel(brewery *untappd.Brewery) *model.Brewery {
	return &model.Brewery{
		Name:  brewery.Name,
		Label: brewery.Label,
		Location: model.BreweryLocation{
			City:      brewery.Location.City,
			State:     brewery.Location.State,
			Latitude:  brewery.Location.Latitude,
			Longitude: brewery.Location.Longitude,
			Country:   brewery.Country,
		},
		Contact: model.BreweryContact{
			Twitter:   brewery.Contact.Twitter,
			Facebook:  brewery.Contact.Facebook,
			Instagram: brewery.Contact.Instagram,
			URL:       brewery.Contact.URL,
		},
		IsActive: brewery.IsActive == 1,
	}
}

func untappdToBeerModel(beer *untappd.Beer, breweryID id.BreweryID) *model.Beer {
	return &model.Beer{
		Name:           beer.Name,
		Label:          beer.Label,
		Description:    beer.Description,
		BreweryID:      breweryID,
		BeerStyle:      beer.Style,
		ABV:            beer.ABV,
		IBU:            beer.IBU,
		IsInProduction: beer.IsInProduction == 1,
	}
}
