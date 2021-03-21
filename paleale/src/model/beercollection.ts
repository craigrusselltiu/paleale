import {List, Map} from "immutable";
import {DateTime} from "luxon";

import { BeerID } from "../id";

import { Beer } from "./beer";
import { Brewery } from "./brewery";

export interface BeerCollectionItem {
  beerID: string;
  storageLocation: string;
  purchasePrice: number;
  purchaseDate: DateTime | undefined;
  purchaseDistributor: string;
  bottlesNumber: number;
  bestBeforeDate: DateTime | undefined;
}

export interface BeerCollection {
  name: string;
  description: string;
  tags: List<string>;
  location: string;
  notes: string;
  items: List<BeerCollectionItem>;
}

export interface DisplayBeerCollection {
  name: string;
  description: string;
  displayImage: string;
  tags: List<string>;
  location: string;
  notes: string;
  items: List<DisplayBeerCollectionItem>;
}

export interface DisplayBeerCollectionItem {
  beerID: string;
  beerData: Beer;
  breweryData: Brewery | undefined;
  storageLocation: string;
  purchasePrice: number;
  purchaseDate: DateTime | undefined;
  purchaseDistributor: string;
  bottlesNumber: number;
  bestBeforeDate: DateTime | undefined;
}
