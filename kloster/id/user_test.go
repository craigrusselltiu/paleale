package id

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestUserIDFromSubject(t *testing.T) {
	assert.Equal(t, "usr0dae7bac6debfd51", string(UserIDFromSubject("google-oauth2|105160053126900320958")))
}
