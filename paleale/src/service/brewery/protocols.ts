import {List, Map} from "immutable";

import {BreweryID} from "../../id";
import {Brewery} from "../../model/brewery";

export interface BulkGetBreweryByIDsParams {
  breweryIDs: List<BreweryID>;
}

export interface BulkGetBreweryByIDsResponse {
  breweries: Map<BreweryID, Brewery>;
}
