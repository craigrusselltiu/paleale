package user

import (
	"context"
	"testing"

	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/model"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/test/integration/tester"
)

/*
	This test AddUserIfNotExists()
	we generate a test user by calling UserIDFromSubject()
	Then we create a User model (object)
	Then we add it to the database
	Check if any error is returned
*/
func TestAddUserIfNotExists(t *testing.T) {
	tester.WithTimeoutContext(tester.DefaultTimeout, func(ctx context.Context) {
		service := tester.Modules.UserService
		userID := id.UserIDFromSubject("test")
		var userModel model.User
		userModel.FirstName = "test"
		err := service.AddUserIfNotExists(ctx, userID, &userModel)
		if err != nil {
			t.Error(err)
			t.FailNow()
		}
	})
}

/*
	This test GetUserByID()
	we generate a test user by calling UserIDFromSubject()
	Then we create a User model (object)
	Then we add it to the database
	Then we query it using the userID generated
	Check if correct user is returned
*/
func TestGetUserByID(t *testing.T) {
	tester.WithTimeoutContext(tester.DefaultTimeout, func(ctx context.Context) {
		service := tester.Modules.UserService
		userID := id.UserIDFromSubject("test")
		var userModel model.User
		userModel.FirstName = "test"
		err := service.AddUserIfNotExists(ctx, userID, &userModel)
		if err != nil {
			t.Error(err)
			t.FailNow()
		}
		ret, err1 := service.GetUserByID(ctx, userID)
		if err1 != nil {
			t.Error(err1)
		}
		if ret.FirstName != "test" {
			t.FailNow()
		}
	})
}

/*
	This test DeleteUserByID()
	we generate a test user by calling UserIDFromSubject()
	Then we create a User model (object)
	Then we add it to the database
	Then we delete the user by using the userID generated
	Check if no error is returned
*/
func TestDeleteUserByID(t *testing.T) {
	tester.WithTimeoutContext(tester.DefaultTimeout, func(ctx context.Context) {
		service := tester.Modules.UserService
		userID := id.UserIDFromSubject("test")
		var userModel model.User
		userModel.FirstName = "test"
		err := service.AddUserIfNotExists(ctx, userID, &userModel)
		if err != nil {
			t.Error(err)
			t.FailNow()
		}
		err1 := service.DeleteUserByID(ctx, userID)
		if err1 != nil {
			t.Error(err1)
			t.FailNow()
		}
	})
}
