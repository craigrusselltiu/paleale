package controller

import (
	"net/http"
)

type HTTPError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func (err *HTTPError) Error() string {
	return err.Message
}

var ErrCannotDecodeBody = &HTTPError{
	Code:    http.StatusBadRequest,
	Message: "cannot decode request body",
}

var ErrUnauthorized = &HTTPError{
	Code:    http.StatusUnauthorized,
	Message: "invalid authorization header",
}
