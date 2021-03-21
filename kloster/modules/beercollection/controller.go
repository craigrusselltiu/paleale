package beercollection

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/auth"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/config"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/controller"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"context"
	"github.com/erathorus/macaw"
	"go.uber.org/zap"
	"net/http"
)

type Controller struct {
	config            *config.Controller
	logger            *zap.Logger
	auth              *auth.Auth
	collectionService *Service
}

func NewController(
	config *config.Controller,
	logger *zap.Logger,
	auth *auth.Auth,
	collectionService *Service,
) *Controller {
	return &Controller{
		config:            config,
		logger:            logger,
		auth:              auth,
		collectionService: collectionService,
	}
}

func (c *Controller) Router() macaw.Router {
	sf := controller.NewScopeFactory(c.logger, c.auth)
	router := macaw.NewRouter()

	router.Handle(macaw.MethodPOST, "bulkGetAllUserBeerCollections", sf.HandleFunc(c.bulkGetAllUserBeerCollections))
	router.Handle(macaw.MethodPOST, "getBeerCollectionByID", sf.HandleFunc(c.getBeerCollectionByID))
	router.Handle(macaw.MethodPOST, "addBeerCollection", sf.HandleFunc(c.addBeerCollection))
	router.Handle(macaw.MethodPOST, "updateBeerCollection", sf.HandleFunc(c.updateBeerCollection))
	router.Handle(macaw.MethodPOST, "deleteBeerCollectionByID", sf.HandleFunc(c.deleteBeerCollectionByID))

	return router
}

func (c *Controller) bulkGetAllUserBeerCollections(s *controller.Scope) error {
	if !s.IsAuthenticated() {
		return controller.ErrUnauthorized
	}

	ctx, cancel := context.WithTimeout(context.Background(), c.config.Timeout.Duration)
	defer cancel()

	collections, err := c.collectionService.BulkGetAllUserBeerCollections(ctx, id.UserIDFromSubject(s.Subject()))
	if err != nil {
		return err
	}

	response := bulkGetAllUserBeerCollectionsResponse{
		Collections: collections,
	}

	return s.WriteJSON(http.StatusOK, &response)
}

func (c *Controller) getBeerCollectionByID(s *controller.Scope) error {
	if !s.IsAuthenticated() {
		return controller.ErrUnauthorized
	}

	var params getBeerCollectionByIDParams
	if err := s.DecodeJSON(&params); err != nil {
		return controller.ErrCannotDecodeBody
	}

	if params.CollectionID.Parent() != id.UserIDFromSubject(s.Subject()) {
		return errIllegalBeerCollectionID
	}

	ctx, cancel := context.WithTimeout(context.Background(), c.config.Timeout.Duration)
	defer cancel()

	collection, err := c.collectionService.GetBeerCollectionByID(ctx, params.CollectionID)
	if err != nil {
		return err
	}

	response := getBeerCollectionByIDResponse{
		Collection: collection,
	}

	return s.WriteJSON(http.StatusOK, &response)
}

func (c *Controller) addBeerCollection(s *controller.Scope) error {
	if !s.IsAuthenticated() {
		return controller.ErrUnauthorized
	}

	var params addBeerCollectionParams
	if err := s.DecodeJSON(&params); err != nil {
		return controller.ErrCannotDecodeBody
	}

	ctx, cancel := context.WithTimeout(context.Background(), c.config.Timeout.Duration)
	defer cancel()

	collectionID, err := c.collectionService.AddBeerCollection(ctx, id.UserIDFromSubject(s.Subject()), params.Collection)
	if err != nil {
		return err
	}

	response := addBeerCollectionResponse{
		CollectionID: collectionID,
	}

	return s.WriteJSON(http.StatusOK, &response)
}

func (c *Controller) updateBeerCollection(s *controller.Scope) error {
	if !s.IsAuthenticated() {
		return controller.ErrUnauthorized
	}

	var params updateBeerCollectionParams
	if err := s.DecodeJSON(&params); err != nil {
		return controller.ErrCannotDecodeBody
	}

	if params.CollectionID.Parent() != id.UserIDFromSubject(s.Subject()) {
		return errIllegalBeerCollectionID
	}

	ctx, cancel := context.WithTimeout(context.Background(), c.config.Timeout.Duration)
	defer cancel()

	return c.collectionService.UpdateBeerCollection(ctx, params.CollectionID, params.Collection)
}

func (c *Controller) deleteBeerCollectionByID(s *controller.Scope) error {
	if !s.IsAuthenticated() {
		return controller.ErrUnauthorized
	}

	var params deleteBeerCollectionByIDParams
	if err := s.DecodeJSON(&params); err != nil {
		return controller.ErrCannotDecodeBody
	}

	if params.CollectionID.Parent() != id.UserIDFromSubject(s.Subject()) {
		return errIllegalBeerCollectionID
	}

	ctx, cancel := context.WithTimeout(context.Background(), c.config.Timeout.Duration)
	defer cancel()

	return c.collectionService.DeleteBeerCollection(ctx, params.CollectionID)
}
