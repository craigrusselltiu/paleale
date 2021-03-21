import {Map} from "immutable";

import {BeerCollectionID} from "../../id";
import GoMapper from "../../model/gomapper";
import AuthAxios from "../authaxios";

import {
  AddBeerCollectionParams, AddBeerCollectionResponse,
  BulkGetAllUserBeerCollectionsResponse, DeleteBeerCollectionByIDParams,
  GetBeerCollectionByIDParams,
  GetBeerCollectionByIDResponse, UpdateBeerCollectionParams,
} from "./protocols";

const BEER_COLLECTIONS_ENDPOINT = "/beerCollections";

export async function bulkGetAllUserBeerCollections(): Promise<BulkGetAllUserBeerCollectionsResponse> {
  const response = await AuthAxios.post(`${BEER_COLLECTIONS_ENDPOINT}/bulkGetAllUserBeerCollections`);
  return {
    collections: Map<BeerCollectionID, {}>(response.data.collections).map(GoMapper.toBeerCollection),
  };
}

export async function getBeerCollectionByID(
  params: GetBeerCollectionByIDParams,
): Promise<GetBeerCollectionByIDResponse> {
  const response = await AuthAxios.post(`${BEER_COLLECTIONS_ENDPOINT}/getBeerCollectionByID`, params);
  return {
    collection: GoMapper.toBeerCollection(response.data.collection),
  };
}

export async function addBeerCollection(params: AddBeerCollectionParams): Promise<AddBeerCollectionResponse> {
  const response = await AuthAxios.post(`${BEER_COLLECTIONS_ENDPOINT}/addBeerCollection`, params);
  return {
    collectionID: response.data.id,
  };
}

export async function updateBeerCollection(params: UpdateBeerCollectionParams) {
  await AuthAxios.post(`${BEER_COLLECTIONS_ENDPOINT}/updateBeerCollection`, params);
}

export async function deleteBeerCollectionByID(params: DeleteBeerCollectionByIDParams) {
  await AuthAxios.post(`${BEER_COLLECTIONS_ENDPOINT}/deleteBeerCollectionByID`, params);
}
