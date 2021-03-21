package profile

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"context"
	"net/http"

	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/auth"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/config"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/controller"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/model"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/untappd"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/user"
	"github.com/erathorus/macaw"
	"go.uber.org/zap"
)

type Controller struct {
	config         *config.Controller
	logger         *zap.Logger
	auth           *auth.Auth
	userService    *user.Service
	untappdService *untappd.Service
}

func NewController(
	config *config.Controller,
	logger *zap.Logger,
	auth *auth.Auth,
	userService *user.Service,
	untappdService *untappd.Service,
) *Controller {
	return &Controller{
		config:         config,
		logger:         logger,
		auth:           auth,
		userService:    userService,
		untappdService: untappdService,
	}
}

func (c *Controller) Router() macaw.Router {
	sf := controller.NewScopeFactory(c.logger, c.auth)
	router := macaw.NewRouter()

	router.Handle(macaw.MethodPOST, "getProfile", sf.HandleFunc(c.getProfile))
	router.Handle(macaw.MethodPOST, "addProfileIfNotExisted", sf.HandleFunc(c.addProfileIfNotExisted))
	router.Handle(macaw.MethodPOST, "authorizeUntappd", sf.HandleFunc(c.authorizeUntappd))
	router.Handle(macaw.MethodPOST, "disconnectToUntappd", sf.HandleFunc(c.disconnectToUntappd))

	return router
}

func (c *Controller) getProfile(s *controller.Scope) error {
	if !s.IsAuthenticated() {
		return controller.ErrUnauthorized
	}

	ctx, cancel := context.WithTimeout(context.Background(), c.config.Timeout.Duration)
	defer cancel()

	userModel, err := c.userService.GetUserByID(ctx, id.UserIDFromSubject(s.Subject()))
	if err != nil {
		return err
	}

	return s.WriteJSON(http.StatusOK, &getProfileResponse{
		FirstName:              userModel.FirstName,
		LastName:               userModel.LastName,
		ProfilePicture:         userModel.ProfilePicture,
		Email:                  userModel.Email,
		IsConnectedWithUntappd: userModel.UntappdAccessToken != "",
	})
}

func (c *Controller) addProfileIfNotExisted(s *controller.Scope) error {
	if !s.IsAuthenticated() {
		return controller.ErrUnauthorized
	}

	var params addProfileParams
	if err := s.DecodeJSON(&params); err != nil {
		return controller.ErrCannotDecodeBody
	}

	ctx, cancel := context.WithTimeout(context.Background(), c.config.Timeout.Duration)
	defer cancel()

	err := c.userService.AddUserIfNotExists(ctx, id.UserIDFromSubject(s.Subject()), &model.User{
		FirstName:      params.FirstName,
		LastName:       params.LastName,
		ProfilePicture: params.ProfilePicture,
		Email:          params.Email,
	})
	if err != nil {
		return err
	}

	return nil
}

func (c *Controller) authorizeUntappd(s *controller.Scope) error {
	if !s.IsAuthenticated() {
		return controller.ErrUnauthorized
	}

	var params authorizeUntappdParams
	if err := s.DecodeJSON(&params); err != nil {
		return controller.ErrCannotDecodeBody
	}

	ctx, cancel := context.WithTimeout(context.Background(), c.config.Timeout.Duration)
	defer cancel()

	token, err := c.untappdService.Authorize(ctx, params.Code)
	if err != nil {
		return err
	}

	return c.userService.ModifyUser(ctx, id.UserIDFromSubject(s.Subject()), func(user *model.User) {
		user.UntappdAccessToken = token
	})
}

func (c *Controller) disconnectToUntappd(s *controller.Scope) error {
	if !s.IsAuthenticated() {
		return controller.ErrUnauthorized
	}

	ctx, cancel := context.WithTimeout(context.Background(), c.config.Timeout.Duration)
	defer cancel()

	return c.userService.ModifyUser(ctx, id.UserIDFromSubject(s.Subject()), func(user *model.User) {
		user.UntappdAccessToken = ""
	})
}
