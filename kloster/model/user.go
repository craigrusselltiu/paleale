package model

type User struct {
	FirstName          string   `bson:"firstName"`
	LastName           string   `bson:"lastName"`
	ProfilePicture     string   `bson:"profilePicture"`
	Email              string   `bson:"email"`
	Permissions        []string `bson:"permissions"`
	UntappdAccessToken string   `bson:"untappdAccessToken"`
}
