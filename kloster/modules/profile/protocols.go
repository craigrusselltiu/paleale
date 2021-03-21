package profile

type getProfileResponse struct {
	FirstName              string `json:"firstName"`
	LastName               string `json:"lastName"`
	ProfilePicture         string `json:"profilePicture"`
	Email                  string `json:"email"`
	IsConnectedWithUntappd bool   `json:"isConnectedWithUntappd"`
}

type addProfileParams struct {
	FirstName      string `json:"firstName"`
	LastName       string `json:"lastName"`
	ProfilePicture string `json:"profilePicture"`
	Email          string `json:"email"`
}

type authorizeUntappdParams struct {
	Code string `json:"code"`
}
