export interface GetProfileResponse {
  firstName: string;
  lastName: string;
  profilePicture: string;
  email: string;
  isConnectedWithUntappd: boolean;
}

export interface AddProfileParams {
  firstName: string;
  lastName: string;
  profilePicture: string;
  email: string;
}

export interface AuthorizeUntappdParams {
  code: string;
}
