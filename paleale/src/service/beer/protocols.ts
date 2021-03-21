import {List, Map} from "immutable";

import {BeerID} from "../../id";
import {Beer} from "../../model/beer";

export interface AddBeerParams {
  beer: Beer;
}

export interface AddBeerResponse {
  beerID: BeerID;
}

export interface BulkGetBeerByIDsParams {
  beerIDs: List<BeerID>;
}

export interface BulkGetBeerByIDsResponse {
  beers: Map<BeerID, Beer>;
}

export interface SearchBeersDBParams {
  phrase: string;
}

export interface BeerIDAndModel {
  id: string;
  model: Beer;
}

export interface SearchBeersDBResponse {
  beers: List<BeerIDAndModel>;
}

export interface SearchBeersUntappdParams {
  phrase: string;
}

export interface SearchBeersUntappdResponse {
  beers: List<BeerIDAndModel>;
}
