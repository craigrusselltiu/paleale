package brewery

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/auth"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/config"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/controller"
	"context"
	"github.com/erathorus/macaw"
	"go.uber.org/zap"
	"net/http"
)

type Controller struct {
	config         *config.Controller
	logger         *zap.Logger
	auth           *auth.Auth
	breweryService *Service
}

func NewController(
	config *config.Controller,
	logger *zap.Logger,
	auth *auth.Auth,
	breweryService *Service,
) *Controller {
	return &Controller{
		config:         config,
		logger:         logger,
		auth:           auth,
		breweryService: breweryService,
	}
}

func (c *Controller) Router() macaw.Router {
	sf := controller.NewScopeFactory(c.logger, c.auth)
	router := macaw.NewRouter()

	router.Handle(macaw.MethodPOST, "bulkGetBreweryByIDs", sf.HandleFunc(c.bulkGetBreweryByIDs))

	return router
}

func (c *Controller) bulkGetBreweryByIDs(s *controller.Scope) error {
	if !s.IsAuthenticated() {
		return controller.ErrUnauthorized
	}

	ctx, cancel := context.WithTimeout(context.Background(), c.config.Timeout.Duration)
	defer cancel()

	var params bulkGetBreweryByIDsParams
	if err := s.DecodeJSON(&params); err != nil {
		return controller.ErrCannotDecodeBody
	}

	breweries, err := c.breweryService.BulkGetBreweryByIDs(ctx, params.BreweryIDs)
	if err != nil {
		return err
	}

	response := bulkGetBreweryByIDsResponse{
		Breweries: breweries,
	}

	return s.WriteJSON(http.StatusOK, &response)
}
