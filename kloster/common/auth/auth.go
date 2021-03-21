package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"strings"
	"time"

	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/config"
)

type Auth struct {
	signingSecret []byte
}

func NewAuth(config *config.Auth) *Auth {
	return &Auth{
		signingSecret: []byte(config.SigningSecret),
	}
}

type header struct {
	Typ string
	Alg string
}

type claims struct {
	Exp int64
	Sub string
}

func (a *Auth) GetSubject(token string) string {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return ""
	}

	headerJSON, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return ""
	}

	var tokenHeader header
	if err = json.Unmarshal(headerJSON, &tokenHeader); err != nil {
		return ""
	}

	if tokenHeader.Typ != "JWT" || tokenHeader.Alg != "HS256" {
		return ""
	}

	claimsJSON, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return ""
	}

	var tokenClaims claims
	if err = json.Unmarshal(claimsJSON, &tokenClaims); err != nil {
		return ""
	}

	if tokenClaims.Exp <= time.Now().Unix() {
		return ""
	}

	sig, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return ""
	}

	hm := hmac.New(sha256.New, a.signingSecret)
	if _, err = hm.Write([]byte(token[:len(parts[0])+len(parts[1])+1])); err != nil {
		return ""
	}
	resultHash := hm.Sum(nil)

	if hmac.Equal(sig, resultHash) {
		return tokenClaims.Sub
	}

	return ""
}
