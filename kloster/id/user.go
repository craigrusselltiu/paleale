package id

import (
	"encoding/hex"
	"github.com/OneOfOne/xxhash"
)

type UserID string

func (d UserID) PartitionKey() string {
	return UserIDPrefix
}

func (d UserID) SortKey() string {
	return string(d[len(UserIDPrefix):])
}

func (d UserID) Key() string {
	return string(d)
}

func UserIDFromSubject(subject string) UserID {
	h := xxhash.New64()
	if _, err := h.Write([]byte(subject)); err != nil {
		panic(err)
	}

	b := make([]byte, 0)
	b = h.Sum(b)
	return UserID(UserIDPrefix + hex.EncodeToString(b))
}
