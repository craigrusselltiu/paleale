package beercollection

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/controller"
	"net/http"
)

var errIllegalBeerCollectionID = &controller.HTTPError{
	Code:    http.StatusBadRequest,
	Message: "illegal beer collection id",
}
