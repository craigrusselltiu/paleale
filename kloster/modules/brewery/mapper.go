package brewery

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/model"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/modelstore"
	"github.com/aws/aws-sdk-go/service/dynamodb"
)

func avToUntappdBreweryDirectory(av *dynamodb.AttributeValue) (*model.UntappdBreweryDirectory, error) {
	untappdBreweryDirectory := &model.UntappdBreweryDirectory{}
	if err := modelstore.GlobalDecoder.Decode(av, untappdBreweryDirectory); err != nil {
		return nil, err
	}
	if untappdBreweryDirectory.UntappdBreweryIDs == nil {
		untappdBreweryDirectory.UntappdBreweryIDs = make(map[string]id.BreweryID)
	}
	return untappdBreweryDirectory, nil
}

func avToBrewery(av *dynamodb.AttributeValue) (*model.Brewery, error) {
	brewery := &model.Brewery{}
	if err := modelstore.GlobalDecoder.Decode(av, brewery); err != nil {
		return nil, err
	}
	return brewery, nil
}
