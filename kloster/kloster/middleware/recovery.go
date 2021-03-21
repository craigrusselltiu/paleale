package middleware

import (
	"net"
	"net/http"
	"net/http/httputil"
	"os"
	"strings"

	"github.com/erathorus/macaw"
	"go.uber.org/zap"
)

func Recovery(logger *zap.Logger) macaw.Middleware {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if err := recover(); err != nil {
					// Check for a broken connection, as it is not really a
					// condition that warrants a panic stack trace.
					var brokenPipe bool
					if ne, ok := err.(*net.OpError); ok {
						if se, ok := ne.Err.(*os.SyscallError); ok {
							if strings.Contains(strings.ToLower(se.Error()), "broken pipe") ||
								strings.Contains(strings.ToLower(se.Error()), "connection reset by peer") {
								brokenPipe = true
							}
						}
					}

					httpRequest, _ := httputil.DumpRequest(r, false)
					if brokenPipe {
						logger.Error(
							"panic recovered: broken pipe",
							zap.Any("error", err),
							zap.ByteString("httpRequest", httpRequest),
						)
					} else {
						logger.Error("panic recovered", zap.Any("error", err))
					}
				}
			}()
			h.ServeHTTP(w, r)
		})
	}
}
