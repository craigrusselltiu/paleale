package modelstore

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/common/config"
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"context"
	"encoding/json"
	"fmt"
	"github.com/VictoriaMetrics/fastcache"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
)

const (
	batchGetItemLimit   = 100
	batchWriteItemLimit = 25

	partitionKeyField = "pid"
	sortKeyField      = "sid"
	valueField        = "v"
)

var (
	GlobalEncoder = dynamodbattribute.NewEncoder()
	GlobalDecoder = dynamodbattribute.NewDecoder()
)

type Element struct {
	ID    id.ID
	Value interface{}
}

type ModelStore struct {
	config *config.ModelStore
	client *dynamodb.DynamoDB
	cache  *fastcache.Cache
}

func NewModelStore(config *config.ModelStore, sess *session.Session) *ModelStore {
	return &ModelStore{
		config: config,
		client: dynamodb.New(sess),
		cache:  fastcache.New(config.MaxCache),
	}
}

func (c *ModelStore) cachePut(itemID id.ID, value *dynamodb.AttributeValue) {
	b, err := json.Marshal(value)
	if err != nil {
		c.cache.Set([]byte(itemID.Key()), b)
	}
}

func (c *ModelStore) cacheBulkPut(kvElems map[string]*dynamodb.AttributeValue) {
	for k, v := range kvElems {
		b, err := json.Marshal(v)
		if err != nil {
			c.cache.Set([]byte(k), b)
		}
	}
}

func (c *ModelStore) cacheGet(itemID id.ID) (*dynamodb.AttributeValue, bool) {
	if !c.cache.Has([]byte(itemID.Key())) {
		return nil, false
	}

	var b []byte
	c.cache.Get(b, []byte(itemID.Key()))

	v := &dynamodb.AttributeValue{}
	if err := json.Unmarshal(b, v); err != nil {
		return nil, false
	}

	return v, true
}

func (c *ModelStore) cacheDelete(itemID id.ID) {
	c.cache.Del([]byte(itemID.Key()))
}

func (c *ModelStore) cacheBulkDelete(itemIDs []id.ID) {
	for _, itemID := range itemIDs {
		c.cache.Del([]byte(itemID.Key()))
	}
}

func (c *ModelStore) Put(ctx context.Context, elem *Element) error {
	item, err := toDynamoDBItem(elem.ID, elem.Value)
	if err != nil {
		return err
	}

	input := dynamodb.PutItemInput{
		Item:      item,
		TableName: aws.String(c.config.DynamoDBTableName),
	}

	_, err = c.client.PutItemWithContext(ctx, &input)
	if err != nil {
		return err
	}

	go c.cachePut(elem.ID, item[valueField])

	return nil
}

func (c *ModelStore) PutIfNotExisted(ctx context.Context, elem *Element) error {
	if c.cache.Has([]byte(elem.ID.Key())) {
		return nil
	}

	item, err := toDynamoDBItem(elem.ID, elem.Value)
	if err != nil {
		return err
	}

	input := dynamodb.PutItemInput{
		Item:                item,
		ConditionExpression: aws.String(fmt.Sprintf("attribute_not_exists(%s)", partitionKeyField)),
		TableName:           aws.String(c.config.DynamoDBTableName),
	}

	_, err = c.client.PutItemWithContext(ctx, &input)
	if err != nil {
		if awsErr, ok := err.(awserr.Error); ok {
			if awsErr.Code() == dynamodb.ErrCodeConditionalCheckFailedException {
				return nil
			}
		} else {
			return err
		}
	}

	go c.cachePut(elem.ID, item[valueField])

	return nil
}

func (c *ModelStore) Get(ctx context.Context, itemID id.ID) (*dynamodb.AttributeValue, error) {
	v, ok := c.cacheGet(itemID)
	if ok {
		return v, nil
	}

	key, err := idToDynamoDBKey(itemID)
	if err != nil {
		return nil, err
	}

	input := dynamodb.GetItemInput{
		Key:                  key,
		ProjectionExpression: aws.String(valueField),
		TableName:            aws.String(c.config.DynamoDBTableName),
	}

	output, err := c.client.GetItemWithContext(ctx, &input)
	if err != nil {
		return nil, err
	}

	av, ok := output.Item[valueField]
	if !ok {
		return nil, ErrNoSuchItem
	}

	go c.cachePut(itemID, av)

	return av, nil
}

func (c *ModelStore) Delete(ctx context.Context, itemID id.ID) error {
	key, err := idToDynamoDBKey(itemID)
	if err != nil {
		return err
	}

	input := dynamodb.DeleteItemInput{
		Key:       key,
		TableName: aws.String(c.config.DynamoDBTableName),
	}
	_, err = c.client.DeleteItemWithContext(ctx, &input)
	if err != nil {
		return err
	}

	c.cacheDelete(itemID)

	return nil
}

func (c *ModelStore) IsIDExisted(ctx context.Context, itemID id.ID) (bool, error) {
	if c.cache.Has([]byte(itemID.Key())) {
		return true, nil
	}

	_, err := c.Get(ctx, itemID)
	if err != nil {
		if err == ErrNoSuchItem {
			return false, nil
		}
		return false, err
	}

	return true, nil
}

func (c *ModelStore) BulkPut(ctx context.Context, elems []Element) (err error) {
	kvElems := make(map[string]*dynamodb.AttributeValue)

	items := make([]*dynamodb.WriteRequest, len(elems))
	for i, elem := range elems {
		var dynamodbItem map[string]*dynamodb.AttributeValue

		dynamodbItem, err = toDynamoDBItem(elem.ID, elem.Value)
		if err != nil {
			return
		}

		kvElems[elem.ID.Key()] = dynamodbItem[valueField]

		items[i] = &dynamodb.WriteRequest{
			PutRequest: &dynamodb.PutRequest{
				Item: dynamodbItem,
			},
		}
	}

	for len(items) > 0 {
		n := len(items)
		if n > batchWriteItemLimit {
			n = batchWriteItemLimit
		}

		tables := make(map[string][]*dynamodb.WriteRequest)
		tables[c.config.DynamoDBTableName] = items[:n]
		items = items[n:]

		input := dynamodb.BatchWriteItemInput{
			RequestItems: tables,
		}

		var output *dynamodb.BatchWriteItemOutput
		output, err = c.client.BatchWriteItemWithContext(ctx, &input)
		if err != nil {
			return
		}

		if output.UnprocessedItems != nil {
			items = append(items, output.UnprocessedItems[c.config.DynamoDBTableName]...)
		}
	}

	go c.cacheBulkPut(kvElems)

	return
}

func (c *ModelStore) BulkGet(ctx context.Context, itemIDs []id.ID) (result map[string]*dynamodb.AttributeValue, err error) {
	itemIDs = uniqueIDs(itemIDs)

	result = make(map[string]*dynamodb.AttributeValue)

	keys := make([]map[string]*dynamodb.AttributeValue, len(itemIDs))
	nKeys := 0
	for _, itemID := range itemIDs {
		if v, ok := c.cacheGet(itemID); ok {
			result[itemID.Key()] = v
		} else {
			keys[nKeys], err = idToDynamoDBKey(itemID)
			if err != nil {
				return
			}
			nKeys++
		}
	}
	keys = keys[:nKeys]

	for len(keys) > 0 {
		n := len(itemIDs)
		if n > batchGetItemLimit {
			n = batchGetItemLimit
		}

		tables := make(map[string]*dynamodb.KeysAndAttributes)
		tables[c.config.DynamoDBTableName] = &dynamodb.KeysAndAttributes{
			Keys: keys[:n],
		}
		keys = keys[n:]

		input := dynamodb.BatchGetItemInput{
			RequestItems: tables,
		}

		var output *dynamodb.BatchGetItemOutput
		output, err = c.client.BatchGetItemWithContext(ctx, &input)
		if err != nil {
			return
		}

		if output.Responses != nil {
			for _, item := range output.Responses[c.config.DynamoDBTableName] {
				result[dynamoDBItemToIDString(item)] = item[valueField]
			}
		}

		if output.UnprocessedKeys != nil {
			unprocessedKA := output.UnprocessedKeys[c.config.DynamoDBTableName]
			if unprocessedKA != nil {
				keys = append(keys, unprocessedKA.Keys...)
			}
		}
	}

	go c.cacheBulkPut(result)

	return
}

func (c *ModelStore) BulkGetWithPartitionKey(
	ctx context.Context,
	partitionKey string,
	sortKey string,
) (map[string]*dynamodb.AttributeValue, string, error) {
	var exclusiveStartKey map[string]*dynamodb.AttributeValue
	if sortKey != "" {
		var err error
		exclusiveStartKey, err = stringToDynamoDBKey(partitionKey, sortKey)
		if err != nil {
			return nil, "", err
		}
	}

	encodedPartitionKey, err := GlobalEncoder.Encode(partitionKey)
	if err != nil {
		return nil, "", err
	}

	expressionAttributeValues := make(map[string]*dynamodb.AttributeValue)
	expressionAttributeValues[":partitionKey"] = encodedPartitionKey
	input := dynamodb.QueryInput{
		ExclusiveStartKey:         exclusiveStartKey,
		KeyConditionExpression:    aws.String(partitionKeyField + " = :partitionKey"),
		ExpressionAttributeValues: expressionAttributeValues,
		TableName:                 aws.String(c.config.DynamoDBTableName),
	}

	output, err := c.client.QueryWithContext(ctx, &input)
	if err != nil {
		return nil, "", err
	}

	result := make(map[string]*dynamodb.AttributeValue)
	for _, item := range output.Items {
		result[dynamoDBItemToIDString(item)] = item[valueField]
	}

	go c.cacheBulkPut(result)

	return result, dynamoDBItemToIDString(output.LastEvaluatedKey), nil
}

func (c *ModelStore) BulkDelete(ctx context.Context, itemIDs []id.ID) (err error) {
	items := make([]*dynamodb.WriteRequest, len(itemIDs))
	for i, itemID := range itemIDs {
		var dynamodbKey map[string]*dynamodb.AttributeValue

		dynamodbKey, err = idToDynamoDBKey(itemID)
		if err != nil {
			return
		}

		items[i] = &dynamodb.WriteRequest{
			DeleteRequest: &dynamodb.DeleteRequest{
				Key: dynamodbKey,
			},
		}
	}

	for len(items) > 0 {
		n := len(items)
		if n > batchWriteItemLimit {
			n = batchWriteItemLimit
		}

		tables := make(map[string][]*dynamodb.WriteRequest)
		tables[c.config.DynamoDBTableName] = items[:n]
		items = items[n:]

		input := dynamodb.BatchWriteItemInput{
			RequestItems: tables,
		}

		var output *dynamodb.BatchWriteItemOutput
		output, err = c.client.BatchWriteItemWithContext(ctx, &input)
		if err != nil {
			return
		}

		if output.UnprocessedItems != nil {
			items = append(items, output.UnprocessedItems[c.config.DynamoDBTableName]...)
		}
	}

	go c.cacheBulkDelete(itemIDs)

	return
}
