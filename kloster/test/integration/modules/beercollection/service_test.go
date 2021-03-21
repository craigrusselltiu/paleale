package beercollection

import (
	"context"
	"testing"

	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/model"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/test/integration/tester"
)

/*
	This test AddBeerCollection()
	we generate a test user by calling UserIDFromSubject()
	Then we create a collection name "test"
	Then we add it to the database
	check if it returns a collectionID
*/
func TestAddBeerCollection(t *testing.T) {
	tester.WithTimeoutContext(tester.DefaultTimeout, func(ctx context.Context) {
		service := tester.Modules.BeerCollectionService
		userID := id.UserIDFromSubject("test")
		var collection model.BeerCollection
		collection.Name = "test"
		ret, err := service.AddBeerCollection(ctx, userID, &collection)
		if err != nil {
			t.Error(err)
		}
		if ret == "" {
			t.FailNow()
		}
	})
}

/*
	This test GetBeerCollectionByID()
	we generate a test user by calling UserIDFromSubject()
	Then we create a collection name "test"
	Then we add it to the database
	Then we query the collection by using the returned collectionID
	check if the query return the correct collection
*/
func TestGetBeerCollectionByID(t *testing.T) {
	tester.WithTimeoutContext(tester.DefaultTimeout, func(ctx context.Context) {
		service := tester.Modules.BeerCollectionService
		userID := id.UserIDFromSubject("test")
		var collection model.BeerCollection
		collection.Name = "test"
		beerCollectionID, err := service.AddBeerCollection(ctx, userID, &collection)
		if err != nil {
			t.Error(err)
		}
		if beerCollectionID == "" {
			t.FailNow()
		}
		ret, err1 := service.GetBeerCollectionByID(ctx, beerCollectionID)
		if err1 != nil {
			t.Error(err1)
		}
		if ret.Name != "test" {
			t.FailNow()
		}
	})
}

/*
	This test BulkGetAllUserBeerCollections()
	we generate a test user by calling UserIDFromSubject()
	Then we create a collection name "test"
	Then we add it to the database
	Then we query all collection by using the userID generated
	check if the query return any collection
*/
func TestBulkGetAllUserBeerCollections(t *testing.T) {
	tester.WithTimeoutContext(tester.DefaultTimeout, func(ctx context.Context) {
		service := tester.Modules.BeerCollectionService
		userID := id.UserIDFromSubject("test")
		var collection model.BeerCollection
		collection.Name = "test"
		ret, err := service.AddBeerCollection(ctx, userID, &collection)
		if err != nil {
			t.Error(err)
		}
		if ret == "" {
			t.FailNow()
		}
		ret1, err1 := service.BulkGetAllUserBeerCollections(ctx, userID)
		if err1 != nil {
			t.Error(err1)
		}
		if ret1 == nil {
			t.FailNow()
		}
	})
}

/*
	This test UpdateBeerCollection()
	we generate a test user by calling UserIDFromSubject()
	Then we create a collection name "test"
	Then we add it to the database
	Then we update the collection name to "testUpdate"
	Then we query the same collection and see if the name changed
*/
func TestUpdateBeerCollection(t *testing.T) {
	tester.WithTimeoutContext(tester.DefaultTimeout, func(ctx context.Context) {
		service := tester.Modules.BeerCollectionService
		userID := id.UserIDFromSubject("test")
		var collection model.BeerCollection
		collection.Name = "test"
		beerCollectionID, err := service.AddBeerCollection(ctx, userID, &collection)
		if err != nil {
			t.Error(err)
		}
		if beerCollectionID == "" {
			t.FailNow()
		}
		collection.Name = "testUpdate"
		err1 := service.UpdateBeerCollection(ctx, beerCollectionID, &collection)
		if err1 != nil {
			t.Error(err1)
		}
		ret, err2 := service.GetBeerCollectionByID(ctx, beerCollectionID)
		if err2 != nil {
			t.Error(err2)
		}
		if ret.Name != "testUpdate" {
			t.FailNow()
		}
	})
}

/*
	This test DeleteBeerCollection()
	we generate a test user by calling UserIDFromSubject()
	Then we create a collection name "test"
	Then we add it to the database
	Then we delete the collection
	check if no error is return
*/
func TestDeleteBeerCollection(t *testing.T) {
	tester.WithTimeoutContext(tester.DefaultTimeout, func(ctx context.Context) {
		service := tester.Modules.BeerCollectionService
		userID := id.UserIDFromSubject("test")
		var collection model.BeerCollection
		collection.Name = "test"
		beerCollectionID, err := service.AddBeerCollection(ctx, userID, &collection)
		if err != nil {
			t.Error(err)
		}
		if beerCollectionID == "" {
			t.FailNow()
		}
		err1 := service.DeleteBeerCollection(ctx, beerCollectionID)
		if err1 != nil {
			t.Error(err1)
			t.FailNow()
		}
	})
}
