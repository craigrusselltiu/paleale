package id

type BeerCollectionID string

func (d BeerCollectionID) PartitionKey() string {
	return ConcatID(string(d.Parent()), BeerCollectionIDPrefix)
}

func (d BeerCollectionID) SortKey() string {
	return string(d[len(d.Parent())+len(BeerCollectionIDPrefix)+1:])
}

func (d BeerCollectionID) Key() string {
	return string(d)
}

func (d BeerCollectionID) Parent() UserID {
	return UserID(getParentID(string(d)))
}

func GenerateBeerCollectionID(userID UserID) BeerCollectionID {
	return BeerCollectionID(ConcatID(string(userID), generateIDWithPrefix(BeerCollectionIDPrefix)))
}
