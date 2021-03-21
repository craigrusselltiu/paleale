package tester

import (
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/config"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/kloster"
	"github.com/BurntSushi/toml"
)

var (
	rootPath      string
	resourcesPath string

	Modules    kloster.ModuleSet
	References references
)

func resolvePaths() {
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		panic("cannot resolve paths")
	}
	var err error
	rootPath, err = filepath.Abs(filepath.Join(filepath.Dir(file), "../../"))
	if err != nil {
		panic(err)
	}
	resourcesPath = filepath.Join(rootPath, "resources/")
}

func loadModules() {
	klosterConfig, err := config.LoadConfigFromFile(filepath.Join(resourcesPath, "kloster.toml"))
	if err != nil {
		panic(err)
	}

	app, err := kloster.NewDevelopment(klosterConfig)
	if err != nil {
		panic(err)
	}
	Modules = app.Modules
}

func loadReferences() {
	if _, err := toml.DecodeFile(filepath.Join(resourcesPath, "references.toml"), &References); err != nil {
		panic(err)
	}
}

func init() {
	resolvePaths()
	loadModules()
	loadReferences()
}

func RunMain(m *testing.M) {
	os.Exit(m.Run())
}
