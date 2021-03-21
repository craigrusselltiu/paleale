package id

import (
	"crypto/rand"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"io"
	"strings"
	"sync/atomic"
	"time"
)

type ID interface {
	PartitionKey() string
	SortKey() string
	Key() string
}

var objectIDCounter = readRandomUint32()
var processUnique = processUniqueBytes()

func processUniqueBytes() [5]byte {
	var b [5]byte
	_, err := io.ReadFull(rand.Reader, b[:])
	if err != nil {
		panic(fmt.Errorf("cannot initialize objectid package with crypto.rand.Reader: %v", err))
	}

	return b
}

func readRandomUint32() uint32 {
	var b [4]byte
	_, err := io.ReadFull(rand.Reader, b[:])
	if err != nil {
		panic(fmt.Errorf("cannot initialize objectid package with crypto.rand.Reader: %v", err))
	}

	return (uint32(b[0]) << 0) | (uint32(b[1]) << 8) | (uint32(b[2]) << 16) | (uint32(b[3]) << 24)
}

func putUint24(b []byte, v uint32) {
	b[0] = byte(v >> 16)
	b[1] = byte(v >> 8)
	b[2] = byte(v)
}

func generateIDFromTimestamp(timestamp time.Time) string {
	var b [12]byte

	binary.BigEndian.PutUint32(b[0:4], uint32(timestamp.Unix()))
	copy(b[4:9], processUnique[:])
	putUint24(b[9:12], atomic.AddUint32(&objectIDCounter, 1))

	return hex.EncodeToString(b[:])
}

func generateIDWithPrefix(prefix string) string {
	return prefix + generateIDFromTimestamp(time.Now())
}

func ConcatID(parent, child string) string {
	return parent + "." + child
}

func getParentID(child string) string {
	p := strings.LastIndexByte(child, '.')
	if p == -1 {
		return ""
	}
	return child[:p]
}
