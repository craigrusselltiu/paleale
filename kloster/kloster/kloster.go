package kloster

import (
	"errors"
	"net/http"
	"os"

	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/config"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/erathorus/macaw"
)

type Kloster struct {
	Modules ModuleSet
}

type Builder struct {
	Config *config.Kloster
	Logger *zap.Logger
}

func (b Builder) Build() (*Kloster, error) {
	if b.Config == nil {
		return nil, errors.New("cannot build kloster: Config is not set")
	}
	if b.Logger == nil {
		return nil, errors.New("cannot build kloster: Logger is not set")
	}
	modules, err := initializeModuleSet(b.Config, b.Logger)
	if err != nil {
		return nil, err
	}
	return &Kloster{Modules: modules}, nil
}

func newDevelopmentLogger() *zap.Logger {
	core := zapcore.NewCore(
		zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig()),
		os.Stderr,
		zap.DebugLevel,
	)
	return zap.New(core, zap.AddStacktrace(zap.WarnLevel), zap.AddCaller())
}

func newProductionLogger() *zap.Logger {
	core := zapcore.NewCore(
		zapcore.NewConsoleEncoder(zap.NewProductionEncoderConfig()),
		os.Stderr,
		zap.InfoLevel,
	)
	return zap.New(core, zap.AddStacktrace(zap.ErrorLevel))
}

func NewProductionBuilder(klosterConfig *config.Kloster) Builder {
	return Builder{
		Config: klosterConfig,
		Logger: newProductionLogger(),
	}
}

func NewDevelopmentBuilder(klosterConfig *config.Kloster) Builder {
	return Builder{
		Config: klosterConfig,
		Logger: newDevelopmentLogger(),
	}
}

func NewProduction(klosterConfig *config.Kloster) (*Kloster, error) {
	return NewProductionBuilder(klosterConfig).Build()
}

func NewDevelopment(klosterConfig *config.Kloster) (*Kloster, error) {
	return NewDevelopmentBuilder(klosterConfig).Build()
}

func (k *Kloster) Serve() {
	logger := k.Modules.Logger

	defer func() {
		if err := recover(); err != nil {
			logger.Panic("cannot serve Kloster", zap.Any("error", err))
		}
	}()

	rootRouter := macaw.NewRouter()
	setupRouter(k, rootRouter)
	rootHandler, err := macaw.BuildHTTPHandler(rootRouter, globalMiddlewareChain(k.Modules.Logger, k.Modules.Config))
	if err != nil {
		logger.Fatal("cannot build Root Handler", zap.Error(err))
	}

	address := k.Modules.Config.HTTP.Address
	logger.Fatal("HTTP fatal error", zap.Error(http.ListenAndServe(address, rootHandler)))
}
