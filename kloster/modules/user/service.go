package user

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/modelstore"
	"context"

	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/model"
)

type Service struct {
	modelStore *modelstore.ModelStore
}

func NewService(modelStore *modelstore.ModelStore) *Service {
	return &Service{
		modelStore: modelStore,
	}
}

func (s *Service) AddUserIfNotExists(ctx context.Context, userID id.UserID, user *model.User) error {
	elem := modelstore.Element{
		ID:    userID,
		Value: user,
	}
	return s.modelStore.PutIfNotExisted(ctx, &elem)
}

func (s *Service) ModifyUser(ctx context.Context, userID id.UserID, modifier func(*model.User)) error {
	user, err := s.GetUserByID(ctx, userID)
	if err != nil {
		return err
	}

	modifier(user)

	elem := modelstore.Element{
		ID:    userID,
		Value: user,
	}

	return s.modelStore.Put(ctx, &elem)
}

func (s *Service) GetUserByID(ctx context.Context, userID id.UserID) (*model.User, error) {
	av, err := s.modelStore.Get(ctx, userID)
	if err != nil {
		return nil, err
	}
	return avToUser(av)
}

func (s *Service) DeleteUserByID(ctx context.Context, userID id.UserID) error {
	return s.modelStore.Delete(ctx, userID)
}
