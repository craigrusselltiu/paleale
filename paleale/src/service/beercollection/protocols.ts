import {Map} from "immutable";

import {BeerCollectionID} from "../../id";
import {BeerCollection} from "../../model/beercollection";

export interface GetBeerCollectionByIDParams {
  collectionID: BeerCollectionID;
}

export interface GetBeerCollectionByIDResponse {
  collection: BeerCollection;
}

export interface BulkGetAllUserBeerCollectionsResponse {
  collections: Map<BeerCollectionID, BeerCollection>;
}

export interface AddBeerCollectionParams {
  collection: BeerCollection;
}

export interface AddBeerCollectionResponse {
  collectionID: BeerCollectionID;
}

export interface UpdateBeerCollectionParams {
  collectionID: BeerCollectionID;
  collection: BeerCollection;
}

export interface DeleteBeerCollectionByIDParams {
  collectionID: BeerCollectionID;
}
