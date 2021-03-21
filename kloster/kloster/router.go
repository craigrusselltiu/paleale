package kloster

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/config"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/kloster/middleware"
	"github.com/erathorus/macaw"
	"go.uber.org/zap"
)

func setupRouter(k *Kloster, rootRouter macaw.Router) {
	mainRouter := macaw.NewRouter()
	setupMainRouter(k, mainRouter)
	rootRouter.AddSubRouter(k.Modules.Config.HTTP.BasePath, mainRouter)
}

func setupMainRouter(k *Kloster, mainRouter macaw.Router) {
	mainRouter.AddSubRouter("beers", k.Modules.BeerController.Router())
	mainRouter.AddSubRouter("beerCollections", k.Modules.BeerCollectionController.Router())
	mainRouter.AddSubRouter("breweries", k.Modules.BreweryController.Router())
	mainRouter.AddSubRouter("profile", k.Modules.ProfileController.Router())
}

func globalMiddlewareChain(logger *zap.Logger, config *config.Kloster) []macaw.Middleware {
	return []macaw.Middleware{
		middleware.Recovery(logger),
		middleware.CORS(config.CORS),
	}
}
