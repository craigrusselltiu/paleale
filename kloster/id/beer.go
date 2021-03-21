package id

type BeerID string

func (d BeerID) PartitionKey() string {
	return BeerIDPrefix
}

func (d BeerID) SortKey() string {
	return string(d[len(BeerIDPrefix):])
}

func (d BeerID) Key() string {
	return string(d)
}

func GenerateBeerID() BeerID {
	return BeerID(generateIDWithPrefix(BeerIDPrefix))
}

type UntappdBeerDirectoryID string

func (d UntappdBeerDirectoryID) PartitionKey() string {
	return "untappd"
}

func (d UntappdBeerDirectoryID) SortKey() string {
	return "Beers"
}

func (d UntappdBeerDirectoryID) Key() string {
	return string(d)
}

const StaticUntappdBeerDirectoryID = UntappdBeerDirectoryID(UntappdBeerDirectoryIDPrefix)
