package untappd

import (
	"context"
	"encoding/json"
	"errors"
	"go.uber.org/zap"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/config"
)

const (
	apiBaseURL   = "https://api.untappd.com/v4/"
	authorizeURL = "https://untappd.com/oauth/authorize/"

	searchBeerEndpoint = "search/beer"
)

var (
	ErrRateLimitExceeded = errors.New("rate limit exceeded")
)

type Service struct {
	config     *config.Untappd
	httpClient http.Client
}

type authMethod uint8

const (
	MethodAccessToken authMethod = iota
	MethodClientSecret
)

type AuthStrategy struct {
	Method      authMethod
	AccessToken string
}

func NewService(config *config.Untappd, logger *zap.Logger) *Service {
	return &Service{
		config: config,
		httpClient: http.Client{
			Timeout: config.RequestTimeout.Duration * time.Second,
		},
	}
}

func AuthAccessToken(accessToken string) AuthStrategy {
	return AuthStrategy{
		Method:      MethodAccessToken,
		AccessToken: accessToken,
	}
}

func AuthClientSecret() AuthStrategy {
	return AuthStrategy{
		Method: MethodClientSecret,
	}
}

func (s *Service) SearchBeers(
	ctx context.Context,
	authStrategy *AuthStrategy,
	searchPhrase string,
	offset int,
	limit int,
	sort string,
) (*SearchBeersResponse, error) {
	query := url.Values{}
	query.Set("q", searchPhrase)
	query.Set("offset", strconv.Itoa(offset))
	query.Set("limit", strconv.Itoa(limit))
	if sort == "checkin" || sort == "name" {
		query.Set("sort", sort)
	}

	rawResponse, err := s.request(ctx, authStrategy, "GET", searchBeerEndpoint, query, nil)
	if err != nil {
		return nil, err
	}

	searchBeersResponse := &SearchBeersResponse{}
	if err := json.Unmarshal(rawResponse.Response, searchBeersResponse); err != nil {
		return nil, err
	}
	return searchBeersResponse, nil
}

func joinURL(url string, endpoint string) string {
	urlHasTrailingSlash := len(url) > 0 && url[len(url)-1] == '/'
	endpointHasTrailingSlash := len(endpoint) > 0 && endpoint[0] == '/'

	switch {
	case urlHasTrailingSlash && endpointHasTrailingSlash:
		return url + endpoint[1:]
	case urlHasTrailingSlash || endpointHasTrailingSlash:
		return url + endpoint
	default:
		return url + "/" + endpoint
	}
}

func (s *Service) request(
	ctx context.Context,
	authStrategy *AuthStrategy,
	method string,
	endpoint string,
	query url.Values,
	body io.Reader,
) (*rawResponse, error) {
	if authStrategy.Method == MethodAccessToken {
		query.Set("access_token", authStrategy.AccessToken)
	} else {
		query.Set("client_id", s.config.ClientID)
		query.Set("client_secret", s.config.ClientSecret)
	}

	requestURL := joinURL(apiBaseURL, endpoint)
	if query != nil {
		requestURL += "?" + query.Encode()
	}
	req, err := http.NewRequest(method, requestURL, body)
	if err != nil {
		return nil, err
	}
	if ctx != nil {
		req = req.WithContext(ctx)
	}
	httpResponse, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer httpResponse.Body.Close()

	rateLimit, err := strconv.Atoi(httpResponse.Header.Get("X-Ratelimit-Remaining"))
	if err != nil {
		return nil, err
	}
	rateLimit--

	if rateLimit <= 0 {
		return nil, ErrRateLimitExceeded
	}

	if !(200 <= httpResponse.StatusCode && httpResponse.StatusCode < 300) {
		return nil, errors.New("request untappd respond with error status code")
	}

	rawResponse := &rawResponse{}
	if err := json.NewDecoder(httpResponse.Body).Decode(rawResponse); err != nil {
		return nil, err
	}
	return rawResponse, nil
}

func (s *Service) Authorize(ctx context.Context, authorizationCode string) (string, error) {
	query := url.Values{}
	query.Set("client_id", s.config.ClientID)
	query.Set("client_secret", s.config.ClientSecret)
	query.Set("response_type", "code")
	query.Set("redirect_url", s.config.OAuth2CallbackURL)
	query.Set("code", authorizationCode)

	requestURL := authorizeURL + "?" + query.Encode()
	req, err := http.NewRequest("GET", requestURL, nil)
	if err != nil {
		return "", err
	}
	if ctx != nil {
		req = req.WithContext(ctx)
	}
	httpResponse, err := s.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer httpResponse.Body.Close()
	if httpResponse.StatusCode != http.StatusOK {
		return "", errors.New("authorize untappd respond with error status code")
	}

	var authorizeResponse struct {
		Response struct {
			AccessToken string `json:"access_token"`
		} `json:"response"`
	}
	if err := json.NewDecoder(httpResponse.Body).Decode(&authorizeResponse); err != nil {
		return "", err
	}
	return authorizeResponse.Response.AccessToken, nil
}
