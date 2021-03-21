package main

import (
	"fmt"
	"log"
	"os"

	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/config"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/kloster"
)

func runProduction() {
	klosterConfig, err := config.LoadConfigFromFile(os.Getenv("KLOSTER_CONFIG"))
	if err != nil {
		log.Fatal(err)
	}

	app, err := kloster.NewProduction(klosterConfig)
	if err != nil {
		log.Fatal(err)
	}

	logger := app.Modules.Logger
	address := app.Modules.Config.HTTP.Address

	logger.Info("start Kloster in Production mode")
	logger.Info(fmt.Sprintf("serving at address %s", address))

	app.Serve()
}

func runDevelopment() {
	klosterConfig, err := config.LoadConfigFromFile("resources/kloster.toml")
	if err != nil {
		log.Fatal(err)
	}
	app, err := kloster.NewDevelopment(klosterConfig)
	if err != nil {
		log.Fatal(err)
	}

	logger := app.Modules.Logger
	address := app.Modules.Config.HTTP.Address

	logger.Info("start Kloster in Development mode")
	logger.Info(fmt.Sprintf("serving at address %s", address))

	app.Serve()
}

func main() {
	if os.Getenv("KLOSTER_MODE") == "production" {
		runProduction()
	} else {
		runDevelopment()
	}
}
