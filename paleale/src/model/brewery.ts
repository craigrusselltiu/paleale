export interface BreweryLocation {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  country: string;
}

export interface BreweryContact {
  twitter: string;
  facebook: string;
  instagram: string;
  url: string;
}

export interface Brewery {
  name: string;
  label: string;
  location: BreweryLocation;
  contact: BreweryContact;
  isActive: boolean;
}
