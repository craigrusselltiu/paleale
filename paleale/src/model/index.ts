import { BeerCollection } from "./beercollection";

export interface CollectionListData {
  collectionID: string;
  collectionData: BeerCollection;
}

export interface CollectionBeerListData {
  name: string;
  dateAdded: Date;
  beerImage: string;
}
