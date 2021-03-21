import {BreweryID} from "../id";

export interface Beer {
  name: string;
  label: string;
  breweryID: BreweryID;
  beerStyle: string;
  abv: number;
  ibu: number;
  isInProduction: boolean;
}
