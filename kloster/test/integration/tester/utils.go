package tester

import (
	"context"
	"time"
)

const (
	DefaultTimeout = 60 * time.Second
)

func WithTimeoutContext(timeout time.Duration, f func(context.Context)) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	f(ctx)
}
