import {Map} from "immutable";

import {BreweryID} from "../../id";
import {Brewery} from "../../model/brewery";
import AuthAxios from "../authaxios";

import {BulkGetBreweryByIDsParams, BulkGetBreweryByIDsResponse} from "./protocols";

const BREWERIES_ENDPOINT = "/breweries";

export async function bulkGetBreweryByIDs(params: BulkGetBreweryByIDsParams): Promise<BulkGetBreweryByIDsResponse> {
  const response = await AuthAxios.post(`${BREWERIES_ENDPOINT}/bulkGetBreweryByIDs`, params);
  return {
    breweries: Map<BreweryID, Brewery>(response.data.breweries),
  };
}
