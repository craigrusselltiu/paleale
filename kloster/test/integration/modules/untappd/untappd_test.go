package untappd

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/untappd"
	"context"
	"testing"

	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/test/integration/tester"
)

func TestService_SearchBeers(t *testing.T) {
	tester.WithTimeoutContext(tester.DefaultTimeout, func(ctx context.Context) {
		service := tester.Modules.UntappdService

		authStrategy := untappd.AuthAccessToken(tester.References.Untappd.AccessToken)

		res, err := service.SearchBeers(
			ctx,
			&authStrategy,
			"ipa",
			0,
			25,
			"name",
		)

		if err != nil {
			t.Error(err)
		}

		if len(res.Beers.Items) == 0 {
			t.FailNow()
		}
	})
}
