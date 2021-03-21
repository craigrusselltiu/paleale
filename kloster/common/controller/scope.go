package controller

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/auth"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/erathorus/macaw"
	"go.uber.org/zap"
	"net/http"
)

// Scope is not thread-safe
type Scope struct {
	writer            http.ResponseWriter
	request           *http.Request
	logger            *zap.Logger
	auth              *auth.Auth
	params            macaw.Params
	isWritten         bool
	subject           string
	isAuthTokenParsed bool
}

type ScopeFactory struct {
	logger *zap.Logger
	auth   *auth.Auth
}

func NewScopeFactory(logger *zap.Logger, auth *auth.Auth) *ScopeFactory {
	return &ScopeFactory{
		logger: logger,
		auth:   auth,
	}
}

func (b *ScopeFactory) HandleFunc(f func(*Scope) error) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		params, ok := r.Context().Value(macaw.ParamsKey).(macaw.Params)
		if !ok {
			params = macaw.Params{}
		}
		scope := Scope{
			writer:  w,
			request: r,
			logger:  b.logger,
			auth:    b.auth,
			params:  params,
		}
		err := f(&scope)

		if err == nil && !scope.isWritten {
			err = scope.WriteJSON(http.StatusOK, &GeneralResponse{"operation executed successfully"})
		}

		if err != nil {
			switch v := err.(type) {
			case *HTTPError:
				_ = scope.WriteJSON(v.Code, v) // nolint:errcheck
			default:
				if scope.logger != nil {
					scope.logger.Error("error while handling request", zap.Error(err))
				}
				if !scope.isWritten {
					// nolint:errcheck
					_ = scope.WriteJSON(http.StatusInternalServerError, &HTTPError{
						Code:    http.StatusInternalServerError,
						Message: "internal error",
					})
				}
			}
		}
	})
}

func (s *Scope) parseAuth() {
	if s.auth == nil || s.isAuthTokenParsed {
		return
	}
	s.isAuthTokenParsed = true
	if h := s.request.Header.Get("Authorization"); len(h) > 7 && h[0:7] == "Bearer " {
		s.subject = s.auth.GetSubject(h[7:])
	}
}

func (s *Scope) IsAuthenticated() bool {
	s.parseAuth()
	return s.subject != ""
}

func (s *Scope) Subject() string {
	s.parseAuth()
	return s.subject
}

var errAlreadyWritten = errors.New("response has already been written")

func (s *Scope) WriteJSON(statusCode int, v interface{}) error {
	if s.isWritten {
		return errAlreadyWritten
	}
	s.isWritten = true
	s.writer.Header().Set("Content-Type", "application/json; charset=utf-8")
	s.writer.Header().Set("X-Content-Type-Options", "nosniff")
	s.writer.WriteHeader(statusCode)
	return json.NewEncoder(s.writer).Encode(v)
}

func (s *Scope) WritePlain(statusCode int, text string) error {
	if s.isWritten {
		return errAlreadyWritten
	}
	s.isWritten = true
	s.writer.Header().Set("Content-Type", "text/plain; charset=utf-8")
	s.writer.Header().Set("X-Content-Type-Options", "nosniff")
	s.writer.WriteHeader(statusCode)
	_, err := fmt.Fprintln(s.writer, text)
	return err
}

func (s *Scope) DecodeJSON(v interface{}) error {
	return json.NewDecoder(s.request.Body).Decode(v)
}

func (s *Scope) Param(key string) string {
	for i := range s.params {
		if s.params[i].Key == key {
			return s.params[i].Value
		}
	}
	return ""
}
