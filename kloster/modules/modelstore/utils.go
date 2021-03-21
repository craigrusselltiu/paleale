package modelstore

import (
	"bitbucket.org/ctiu6442/m14b-group-1-cp55/kloster/id"
	"github.com/aws/aws-sdk-go/service/dynamodb"
)

func toDynamoDBItem(id id.ID, value interface{}) (map[string]*dynamodb.AttributeValue, error) {
	encodedPartitionKey, err := GlobalEncoder.Encode(id.PartitionKey())
	if err != nil {
		return nil, err
	}

	encodedSortKey, err := GlobalEncoder.Encode(id.SortKey())
	if err != nil {
		return nil, err
	}

	encodedValue, err := GlobalEncoder.Encode(value)
	if err != nil {
		return nil, err
	}

	av := make(map[string]*dynamodb.AttributeValue)
	av[partitionKeyField] = encodedPartitionKey
	av[sortKeyField] = encodedSortKey
	av[valueField] = encodedValue
	return av, nil
}

func idToDynamoDBKey(id id.ID) (map[string]*dynamodb.AttributeValue, error) {
	return stringToDynamoDBKey(id.PartitionKey(), id.SortKey())
}

func stringToDynamoDBKey(partitionKey string, sortKey string) (map[string]*dynamodb.AttributeValue, error) {
	encodedPartitionKey, err := GlobalEncoder.Encode(partitionKey)
	if err != nil {
		return nil, err
	}

	encodedSortKey, err := GlobalEncoder.Encode(sortKey)
	if err != nil {
		return nil, err
	}

	av := make(map[string]*dynamodb.AttributeValue)
	av[partitionKeyField] = encodedPartitionKey
	av[sortKeyField] = encodedSortKey
	return av, nil
}

func dynamoDBItemToIDString(item map[string]*dynamodb.AttributeValue) string {
	if item == nil {
		return ""
	}
	partitionKey := ""
	sortKey := ""
	if v, ok := item[partitionKeyField]; ok {
		partitionKey = *v.S
	}
	if v, ok := item[sortKeyField]; ok {
		sortKey = *v.S
	}

	if partitionKey == "" || sortKey == "" {
		return ""
	}

	return partitionKey + sortKey
}

func uniqueIDs(itemIDs []id.ID) []id.ID {
	unique := make(map[id.ID]bool)

	for _, itemID := range itemIDs {
		unique[itemID] = true
	}

	result := make([]id.ID, 0)
	for k := range unique {
		result = append(result, k)
	}

	return result
}
