import {List, Map} from "immutable";

import {BeerID} from "../../id";
import {Beer} from "../../model/beer";
import AuthAxios from "../authaxios";

import {
  AddBeerParams,
  AddBeerResponse, BeerIDAndModel,
  BulkGetBeerByIDsParams,
  BulkGetBeerByIDsResponse,
  SearchBeersDBParams, SearchBeersDBResponse, SearchBeersUntappdParams, SearchBeersUntappdResponse,
} from "./protocols";

const BEERS_ENDPOINT = "/beers";

export async function addBeer(params: AddBeerParams): Promise<AddBeerResponse> {
  const response = await AuthAxios.post(`${BEERS_ENDPOINT}/addBeer`, params);
  return {
    beerID: response.data.beerID,
  };
}

export async function bulkGetBeerByIDs(params: BulkGetBeerByIDsParams): Promise<BulkGetBeerByIDsResponse> {
  const response = await AuthAxios.post(`${BEERS_ENDPOINT}/bulkGetBeerByIDs`, params);
  return {
    beers: Map<BeerID, Beer>(response.data.beers),
  };
}

export async function searchBeersDB(params: SearchBeersDBParams): Promise<SearchBeersDBResponse> {
  const response = await AuthAxios.post(`${BEERS_ENDPOINT}/searchBeersDB`, params);
  return {
    beers: List<BeerIDAndModel>(response.data.beers),
  };
}

export async function searchBeersUntappd(params: SearchBeersUntappdParams): Promise<SearchBeersUntappdResponse> {
  const response = await AuthAxios.post(`${BEERS_ENDPOINT}/searchBeersUntappd`, params);
  return {
    beers: List<BeerIDAndModel>(response.data.beers),
  };
}
