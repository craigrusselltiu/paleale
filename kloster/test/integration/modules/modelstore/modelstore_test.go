package modelstore

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/modules/modelstore"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/test/integration/tester"
	"context"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/stretchr/testify/assert"
	"testing"
)

type item struct {
	Title        string `json:"title"`
	BetterTittle string `json:"betterTitle"`
}

var (
	firstKey  = id.GenerateBeerID()
	firstItem = &item{
		Title:        "First title",
		BetterTittle: "First better title",
	}
	secondKey  = id.GenerateBeerID()
	secondItem = &item{
		Title:        "Second title",
		BetterTittle: "Second better title",
	}
	thirdKey  = id.GenerateBreweryID()
	thirdItem = &item{
		Title:        "Third title",
		BetterTittle: "Third better title",
	}
)

func assertAVEqual(t *testing.T, av *dynamodb.AttributeValue, expected *item) {
	var decodedItem item
	assert.NoError(t, modelstore.GlobalDecoder.Decode(av, &decodedItem))
	assert.Equal(t, expected, &decodedItem)
}

func TestPut(t *testing.T) {
	tester.WithTimeoutContext(tester.DefaultTimeout, func(ctx context.Context) {
		modelStore := tester.Modules.ModelStore

		assert.NoError(t, modelStore.Put(ctx, &modelstore.Element{ID: firstKey, Value: firstItem}))
		av, err := modelStore.Get(ctx, firstKey)
		assert.NoError(t, err)
		assertAVEqual(t, av, firstItem)

		assert.NoError(t, modelStore.Delete(ctx, firstKey))
	})
}

func TestPutIfNotExisted(t *testing.T) {
	tester.WithTimeoutContext(tester.DefaultTimeout, func(ctx context.Context) {
		modelStore := tester.Modules.ModelStore

		assert.NoError(t, modelStore.PutIfNotExisted(ctx, &modelstore.Element{ID: firstKey, Value: firstItem}))
		assert.NoError(t, modelStore.PutIfNotExisted(ctx, &modelstore.Element{ID: firstKey, Value: secondItem}))
		av, err := modelStore.Get(ctx, firstKey)
		assert.NoError(t, err)
		assertAVEqual(t, av, firstItem)

		assert.NoError(t, modelStore.Delete(ctx, firstKey))
	})
}

func TestIsIDExisted(t *testing.T) {
	tester.WithTimeoutContext(tester.DefaultTimeout, func(ctx context.Context) {
		modelStore := tester.Modules.ModelStore

		ok, err := modelStore.IsIDExisted(ctx, firstKey)
		assert.NoError(t, err)
		assert.False(t, ok)
		assert.NoError(t, modelStore.Put(ctx, &modelstore.Element{ID: firstKey, Value: firstItem}))
		ok, err = modelStore.IsIDExisted(ctx, firstKey)
		assert.NoError(t, err)
		assert.True(t, ok)

		assert.NoError(t, modelStore.Delete(ctx, firstKey))
	})
}

func TestBulkPut(t *testing.T) {
	tester.WithTimeoutContext(tester.DefaultTimeout, func(ctx context.Context) {
		modelStore := tester.Modules.ModelStore

		assert.NoError(t, modelStore.BulkPut(ctx, []modelstore.Element{
			{
				ID:    firstKey,
				Value: firstItem,
			},
			{
				ID:    secondKey,
				Value: secondItem,
			},
			{
				ID:    thirdKey,
				Value: thirdItem,
			},
		}))

		avs, err := modelStore.BulkGet(ctx, []id.ID{firstKey, secondKey, thirdKey})
		assert.NoError(t, err)
		assert.Len(t, avs, 3)
		assertAVEqual(t, avs[firstKey.Key()], firstItem)
		assertAVEqual(t, avs[secondKey.Key()], secondItem)
		assertAVEqual(t, avs[thirdKey.Key()], thirdItem)

		assert.NoError(t, modelStore.BulkDelete(ctx, []id.ID{firstKey, secondKey, thirdKey}))
	})
}
