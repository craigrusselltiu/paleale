package modelstore

import (
	"errors"
)

var ErrNoSuchItem = errors.New("item with given id is not existed")

var ErrIllegalArguments = errors.New("illegal arguments")
