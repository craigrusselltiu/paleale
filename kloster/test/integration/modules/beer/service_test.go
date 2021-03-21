package beer

import (
	"context"
	"testing"

	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/untappd"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/test/integration/tester"
)

/*
	This is testing AddBeer()
	It searchs for an ipa beer from untappd and try to add it
	After add we check if it returns a beerID
*/
func TestAddBeer(t *testing.T) {
	tester.WithTimeoutContext(tester.DefaultTimeout, func(ctx context.Context) {
		beer := tester.Modules.BeerService
		authStrategy := untappd.AuthAccessToken(tester.References.Untappd.AccessToken)
		newbeers, err := beer.SearchBeersUntappd(ctx, &authStrategy, "ipa")
		if err != nil {
			t.Error(err)
		}
		beerID, err1 := beer.AddBeer(ctx, newbeers[0].Model)
		if err1 != nil {
			t.Error(err1)
		}

		if beerID == "" {
			t.FailNow()
		}
	})
}

/*
	This is testing BulkGetBeerByIDs()
	we create a list of BeerID, they are all random numbers
	check if it returns a map of beers or not
*/
func TestBulkGetBeerByIDs(t *testing.T) {
	tester.WithTimeoutContext(tester.DefaultTimeout, func(ctx context.Context) {
		beer := tester.Modules.BeerService
		iIDs := make([]id.BeerID, 2)
		iIDs[0] = "0121323"
		iIDs[1] = "132442"
		newbeers, err := beer.BulkGetBeerByIDs(ctx, iIDs)
		if err != nil {
			t.Error(err)
		}
		if newbeers == nil {
			t.FailNow()
		}
	})
}

/*
	This test SearchBeersDB()
	We simply search for ipa beers and see if it returns anything
	This will check if the method search our database correctly
* need to change bleve_index_path in kloster.toml = /tmp/kloster_test.bleve
* for this test to work
*/
func TestSearchBeersDB(t *testing.T) {
	tester.WithTimeoutContext(tester.DefaultTimeout, func(ctx context.Context) {
		beer := tester.Modules.BeerService
		newbeers, err := beer.SearchBeersDB(ctx, "ipa", 10)
		if err != nil {
			t.Error(err)
		}
		if newbeers == nil {
			t.FailNow()
		}
	})
}

/*
	This test SearchBeerUntappd()
	we search for ipa beers in untappd database and see if it return anything
	This will check if the method request untappd correctly
*/
func TestSearchBeersUntappd(t *testing.T) {
	tester.WithTimeoutContext(tester.DefaultTimeout, func(ctx context.Context) {
		beer := tester.Modules.BeerService
		authStrategy := untappd.AuthAccessToken(tester.References.Untappd.AccessToken)
		newbeers, err := beer.SearchBeersUntappd(ctx, &authStrategy, "ipa")
		if err != nil {
			t.Error(err)
		}
		if newbeers == nil {
			t.FailNow()
		}
	})
}
