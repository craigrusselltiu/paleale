package beer

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/auth"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/config"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/controller"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/untappd"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/user"
	"context"
	"github.com/erathorus/macaw"
	"go.uber.org/zap"
	"net/http"
)

type Controller struct {
	config      *config.Controller
	logger      *zap.Logger
	auth        *auth.Auth
	beerService *Service
	userService *user.Service
}

func NewController(
	config *config.Controller,
	logger *zap.Logger,
	auth *auth.Auth,
	beerService *Service,
	userService *user.Service,
) *Controller {
	return &Controller{
		config:      config,
		logger:      logger,
		auth:        auth,
		beerService: beerService,
		userService: userService,
	}
}

func (c *Controller) Router() macaw.Router {
	sf := controller.NewScopeFactory(c.logger, c.auth)
	router := macaw.NewRouter()

	router.Handle(macaw.MethodPOST, "addBeer", sf.HandleFunc(c.addBeer))
	router.Handle(macaw.MethodPOST, "bulkGetBeerByIDs", sf.HandleFunc(c.bulkGetBeerByIDs))
	router.Handle(macaw.MethodPOST, "searchBeersDB", sf.HandleFunc(c.searchBeersDB))
	router.Handle(macaw.MethodPOST, "searchBeersUntappd", sf.HandleFunc(c.searchBeersUntappd))

	return router
}

func (c *Controller) addBeer(s *controller.Scope) error {
	if !s.IsAuthenticated() {
		return controller.ErrUnauthorized
	}

	var params addBeerParams
	if err := s.DecodeJSON(&params); err != nil {
		return controller.ErrCannotDecodeBody
	}

	ctx, cancel := context.WithTimeout(context.Background(), c.config.Timeout.Duration)
	defer cancel()

	beerID, err := c.beerService.AddBeer(ctx, params.Beer)
	if err != nil {
		return err
	}

	response := addBeerResponse{
		BeerID: beerID,
	}

	return s.WriteJSON(http.StatusOK, &response)
}

func (c *Controller) bulkGetBeerByIDs(s *controller.Scope) error {
	if !s.IsAuthenticated() {
		return controller.ErrUnauthorized
	}

	ctx, cancel := context.WithTimeout(context.Background(), c.config.Timeout.Duration)
	defer cancel()

	var params bulkGetBeerByIDsParams
	if err := s.DecodeJSON(&params); err != nil {
		return controller.ErrCannotDecodeBody
	}

	beers, err := c.beerService.BulkGetBeerByIDs(ctx, params.BeerIDs)
	if err != nil {
		return err
	}

	response := bulkGetBeerByIDsResponse{
		Beers: beers,
	}

	return s.WriteJSON(http.StatusOK, &response)
}

func (c *Controller) searchBeersDB(s *controller.Scope) error {
	if !s.IsAuthenticated() {
		return controller.ErrUnauthorized
	}

	ctx, cancel := context.WithTimeout(context.Background(), c.config.Timeout.Duration)
	defer cancel()

	var params searchBeersDBParams
	if err := s.DecodeJSON(&params); err != nil {
		return controller.ErrCannotDecodeBody
	}

	beers, err := c.beerService.SearchBeersDB(ctx, params.Phrase, 20)
	if err != nil {
		return err
	}

	response := searchBeersDBResponse{
		Beers: beers,
	}

	return s.WriteJSON(http.StatusOK, &response)
}

func (c *Controller) searchBeersUntappd(s *controller.Scope) error {
	if !s.IsAuthenticated() {
		return controller.ErrUnauthorized
	}

	ctx, cancel := context.WithTimeout(context.Background(), c.config.Timeout.Duration)
	defer cancel()

	userModel, err := c.userService.GetUserByID(ctx, id.UserIDFromSubject(s.Subject()))
	if err != nil {
		return controller.ErrCannotDecodeBody
	}

	var authStrategy untappd.AuthStrategy
	if userModel.UntappdAccessToken == "" {
		authStrategy = untappd.AuthClientSecret()
	} else {
		authStrategy = untappd.AuthAccessToken(userModel.UntappdAccessToken)
	}

	var params searchBeersUntappdParams
	if err := s.DecodeJSON(&params); err != nil {
		return err
	}

	beers, err := c.beerService.SearchBeersUntappd(ctx, &authStrategy, params.Phrase)
	if err != nil {
		return err
	}

	response := searchBeersUntappdResponse{
		Beers: beers,
	}

	return s.WriteJSON(http.StatusOK, &response)
}
