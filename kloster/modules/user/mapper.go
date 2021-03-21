package user

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/model"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/modelstore"
	"github.com/aws/aws-sdk-go/service/dynamodb"
)

func avToUser(av *dynamodb.AttributeValue) (*model.User, error) {
	user := &model.User{}
	if err := modelstore.GlobalDecoder.Decode(av, user); err != nil {
		return nil, err
	}
	return user, nil
}
