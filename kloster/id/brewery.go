package id

type BreweryID string

func (d BreweryID) PartitionKey() string {
	return BreweryIDPrefix
}

func (d BreweryID) SortKey() string {
	return string(d[len(BreweryIDPrefix):])
}

func (d BreweryID) Key() string {
	return string(d)
}

func GenerateBreweryID() BreweryID {
	return BreweryID(generateIDWithPrefix(BreweryIDPrefix))
}

type UntappdBreweryDirectoryID string

func (d UntappdBreweryDirectoryID) PartitionKey() string {
	return "untappd"
}

func (d UntappdBreweryDirectoryID) SortKey() string {
	return "Breweries"
}

func (d UntappdBreweryDirectoryID) Key() string {
	return string(d)
}

const StaticUntappdBreweryDirectoryID = UntappdBreweryDirectoryID(untappdBreweryDirectoryIDPrefix)
