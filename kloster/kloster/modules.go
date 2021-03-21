// nolint:deadcode,varcheck,unused
package kloster

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/auth"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/config"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/aws"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/beer"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/beercollection"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/brewery"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/modelstore"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/profile"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/untappd"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/user"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/google/wire"
	"go.uber.org/zap"
)

type ModuleSet struct {
	Config *config.Kloster

	Logger *zap.Logger

	Auth *auth.Auth

	AWSSession *session.Session

	ModelStore *modelstore.ModelStore

	BreweryController *brewery.Controller
	BreweryService    *brewery.Service

	BeerController *beer.Controller
	BeerService    *beer.Service

	BeerCollectionController *beercollection.Controller
	BeerCollectionService    *beercollection.Service

	UntappdService *untappd.Service

	UserService *user.Service

	ProfileController *profile.Controller
}

var configModules = wire.NewSet(
	wire.FieldsOf(
		new(*config.Kloster),
		"Auth",
		"AWS",
		"ModelStore",
		"BeerService",
		"Controller",
		"Untappd",
	),
)

var klosterModules = wire.NewSet(
	wire.Struct(new(ModuleSet), "*"),
	configModules,
	auth.NewAuth,
	aws.GetAWSSession,
	modelstore.NewModelStore,
	brewery.NewController,
	brewery.NewService,
	beer.NewController,
	beer.NewService,
	beercollection.NewController,
	beercollection.NewService,
	untappd.NewService,
	user.NewService,
	profile.NewController,
)
