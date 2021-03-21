package service

import (
	"errors"
)

var ErrInvalidID = errors.New("invalid id")
var ErrNilFilter = errors.New("nil filter slice")
