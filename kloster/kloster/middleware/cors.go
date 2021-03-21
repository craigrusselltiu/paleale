package middleware

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/config"
	"github.com/erathorus/macaw"
	"github.com/rs/cors"
)

func CORS(config *config.CORS) macaw.Middleware {
	if config == nil {
		return nil
	}

	middleware := cors.New(cors.Options{
		AllowedOrigins:   config.AllowedOrigins,
		AllowedMethods:   config.AllowedMethods,
		AllowedHeaders:   config.AllowedHeaders,
		AllowCredentials: config.AllowCredentials,
	})

	return middleware.Handler
}
