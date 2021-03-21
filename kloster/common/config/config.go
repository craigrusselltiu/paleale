package config

import (
	"github.com/BurntSushi/toml"
)

type HTTP struct {
	Address  string `toml:"address"`
	BasePath string `toml:"base_path"`
}

type CORS struct {
	Enabled          bool     `toml:"enabled"`
	AllowedOrigins   []string `toml:"allowed_origins"`
	AllowedMethods   []string `toml:"allowed_methods"`
	AllowedHeaders   []string `toml:"allowed_headers"`
	AllowCredentials bool     `toml:"allowed_credentials"`
}

type Auth struct {
	SigningSecret string `toml:"signing_secret"`
}

type AWS struct {
	Region          string `toml:"region"`
	AccessKeyID     string `toml:"access_key_id"`
	SecretAccessKey string `toml:"secret_access_key"`
	SessionToken    string `toml:"session_token"`
}

type ModelStore struct {
	DynamoDBTableName string `toml:"dynamodb_table_name"`
	MaxCache          int    `toml:"max_cache"`
}

type BeerService struct {
	BleveIndexPath string `toml:"bleve_index_path"`
}

type Untappd struct {
	RequestTimeout    duration `toml:"request_timeout"`
	ClientID          string   `toml:"client_id"`
	ClientSecret      string   `toml:"client_secret"`
	OAuth2CallbackURL string   `toml:"oauth2_callback_url"`
}

type Controller struct {
	Timeout duration `toml:"timeout"`
}

type Kloster struct {
	HTTP        *HTTP        `toml:"http"`
	CORS        *CORS        `toml:"cors"`
	Auth        *Auth        `toml:"auth"`
	AWS         *AWS         `toml:"aws"`
	ModelStore  *ModelStore  `toml:"model_store"`
	BeerService *BeerService `toml:"beer_service"`
	Untappd     *Untappd     `toml:"untappd"`
	Controller  *Controller  `toml:"controller"`
}

func LoadConfigFromFile(configPath string) (*Kloster, error) {
	kloster := &Kloster{}
	if _, err := toml.DecodeFile(configPath, kloster); err != nil {
		return nil, err
	}
	return kloster, nil
}
