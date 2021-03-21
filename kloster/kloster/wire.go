// +build wireinject

package kloster

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/config"
	"github.com/google/wire"
	"go.uber.org/zap"
)

func initializeModuleSet(klosterConfig *config.Kloster, logger *zap.Logger) (ModuleSet, error) {
	wire.Build(klosterModules)
	return ModuleSet{}, nil
}
