package beercollection

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/model"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/modelstore"
	"github.com/aws/aws-sdk-go/service/dynamodb"
)

func avToBeerCollection(av *dynamodb.AttributeValue) (*model.BeerCollection, error) {
	collection := &model.BeerCollection{}
	if err := modelstore.GlobalDecoder.Decode(av, collection); err != nil {
		return nil, err
	}
	return collection, nil
}
