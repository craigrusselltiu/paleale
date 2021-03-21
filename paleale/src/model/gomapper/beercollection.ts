import {List} from "immutable";
import {DateTime} from "luxon";

import {BeerCollection, BeerCollectionItem} from "../beercollection";

export function toBeerCollectionItem(item: any): BeerCollectionItem {
  return {
    beerID: item.beerID,
    bestBeforeDate: DateTime.fromISO(item.bestBeforeDate),
    bottlesNumber: item.bottlesNumber,
    purchaseDate: DateTime.fromISO(item.purchaseDate),
    purchaseDistributor: item.purchaseDistributor,
    purchasePrice: item.purchasePrice,
    storageLocation: item.storageLocation,
  };
}

export function toBeerCollection(collection: any): BeerCollection {
  return {
    description: collection.description,
    items: List(collection.items).map(toBeerCollectionItem),
    location: collection.location,
    name: collection.name,
    notes: collection.notes,
    tags: List<string>(collection.tags),
  };
}
