import {HTMLSelect, Icon, InputGroup, Intent} from "@blueprintjs/core";
import {IconNames} from "@blueprintjs/icons";
import * as FuzzySort from "fuzzysort";
import { List, Map } from "immutable";
import React from "react";

import { BeerCollectionID, BeerID, BreweryID } from "../../id";
import {BeerCollection, DisplayBeerCollection, DisplayBeerCollectionItem} from "../../model/beercollection";
import BeerServices from "../../service/beer";
import BeerCollectionServices from "../../service/beercollection";
import BreweryServices from "../../service/brewery";
import AppToaster from "../common/apptoaster/AppToaster";
import BaseLayout from "../common/baselayout/BaseLayout";
import CircleIndicator from "../common/progress/CircleIndicator";

import CollectionAdd from "./elements/CollectionAdd";
import CollectionCard from "./elements/CollectionCard";

export interface CollectionListStates {
  displayCollectionList: Map<BeerCollectionID, BeerCollection>;
  displayCollectionListParams: Map<BeerCollectionID, DisplayBeerCollection>;
  isCollectionListLoaded: boolean;
  query: string;
  searchString: string;
  searchType: string;
  userCollectionList: Map<BeerCollectionID, BeerCollection>;
}

const SEARCH_OPTIONS = [
  {label: "Name", value: "name"},
  {label: "Location", value: "location"},
  {label: "Description", value: "description"},
  {label: "Notes", value: "notes"},
];

export default class CollectionList extends React.PureComponent<{}, CollectionListStates> {
  public state: CollectionListStates = {
    displayCollectionList: Map<BeerCollectionID, BeerCollection>(),
    displayCollectionListParams: Map<BeerCollectionID, DisplayBeerCollection>(),
    isCollectionListLoaded: false,
    query: "",
    searchString: "",
    searchType: "name",
    userCollectionList: Map<BeerCollectionID, BeerCollection>(),
  };

  public componentDidMount = async () => {
    await this.reloadCollectionListWithItems();
  }

  public render() {
    const loader = (
      <div className="flex h-screen w-full justify-center items-center">
        <CircleIndicator/>
      </div>
    );

    return (
      <BaseLayout>
        {this.state.isCollectionListLoaded ? this.renderList() : loader}
      </BaseLayout>
    );
  }

  private renderList() {
    const searchButton = (
      <Icon className="flex my-2 mx-1" icon={IconNames.SEARCH}/>
    );

    const collection = Map.isMap(this.state.displayCollectionList) ?
      this.state.displayCollectionList.map((value, key) => (
            <CollectionCard
                key={key}
                collectionID={key}
                collectionData={this.state.displayCollectionListParams.get(key)}
                reloadParentList={this.reloadCollectionListWithItems}
            />
        )).toList() : null;

    return (
      <div>
        <div className="flex flex-row pt-2 pr-4 justify-end">
          <CollectionAdd reloadParentList={this.reloadCollectionListWithItems}/>
          <InputGroup
            placeholder="Collection name..."
            onChange={this.inputOnChangeHandler}
            rightElement={searchButton}
            value={this.state.searchString}
            fill={false}
          />
          <HTMLSelect
            onChange={this.filterOnChangeHandler}
            options={SEARCH_OPTIONS}
            minimal={true}
          />
        </div>
        <div className="flex flex-wrap ml-16 my-8">
          {collection}
        </div>
      </div>
    );
  }

  private reloadCollectionList = async () => {
    try {
      const rawCollectionList = await BeerCollectionServices.bulkGetAllUserBeerCollections();
      await this.setState({
        displayCollectionList: rawCollectionList.collections,
        userCollectionList: rawCollectionList.collections,
      });
    } catch {
      AppToaster.show({
        intent: Intent.DANGER,
        message: "Error while loading collection list",
      });
    }
  }

  private reloadCollectionListWithItems = async () => {
    try {
      await this.setState({
        isCollectionListLoaded: false,
      });
      const rawCollectionList = await BeerCollectionServices.bulkGetAllUserBeerCollections();
      await this.setState({
        displayCollectionList: rawCollectionList.collections,
        isCollectionListLoaded: this.state.userCollectionList.size === 0 ? true : false,
        userCollectionList: rawCollectionList.collections,
      });
      await this.getFullCollectionItemList(this.state);
    } catch {
      AppToaster.show({
        intent: Intent.DANGER,
        message: "Error while loading collection list",
      });
    }
  }

  private getFullCollectionItemList(state: CollectionListStates) {
    Map<BeerCollectionID, DisplayBeerCollection>().withMutations((map) => {
      state.userCollectionList.map(async (_, key) => {
        const userCollection = await BeerCollectionServices.getBeerCollectionByID({collectionID: key});

        const beerIDList = Map<BeerID, boolean>().withMutations((beerMap) => {
          userCollection.collection.items.forEach((item) => {
            beerMap.set(item.beerID, true);
          });
        }).keySeq().toList();

        const allBeerInfo = await BeerServices.bulkGetBeerByIDs({beerIDs: beerIDList});
        const breweryIDList = Map<BreweryID, boolean>().withMutations((breweryMap) => {
          allBeerInfo.beers.forEach((item) => {
            breweryMap.set(item.breweryID, true);
          });
        }).keySeq().toList();
        const allBreweryInfo = await BreweryServices.bulkGetBreweryByIDs({breweryIDs: breweryIDList});
        let collectionImage = "";
        const displayCollectionItems = List<DisplayBeerCollectionItem>().withMutations((itemList) => {
          userCollection.collection.items.forEach((item) => {
            const beerData = allBeerInfo.beers.get(item.beerID);
            if (!beerData) { return; }
            if (collectionImage === "") {
              collectionImage = beerData.label;
            }
            const breweryData = allBreweryInfo.breweries.get(beerData.breweryID);
            itemList.push({
              beerData,
              beerID: item.beerID,
              bestBeforeDate: item.bestBeforeDate,
              bottlesNumber: item.bottlesNumber,
              breweryData,
              purchaseDate: item.purchaseDate,
              purchaseDistributor: item.purchaseDistributor,
              purchasePrice: item.purchasePrice,
              storageLocation: item.storageLocation,
            });
          });
        });

        map.set(key, {
          description: userCollection.collection.description,
          displayImage: collectionImage,
          items: displayCollectionItems,
          location: userCollection.collection.location,
          name: userCollection.collection.name,
          notes: userCollection.collection.notes,
          tags: userCollection.collection.tags,
        });
        if (map.size ===  state.displayCollectionList.size) {
          this.setState({
            displayCollectionListParams: map,
            isCollectionListLoaded: true,
          });
        }
      });
    });
  }

  private inputOnChangeHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await this.setState({
      searchString: event.target.value,
    });
    if (!this.state.userCollectionList) { return; }
    const fuzzyResult = FuzzySort.go<BeerCollection>(this.state.searchString,
      this.state.userCollectionList.valueSeq().toArray(), {key: this.state.searchType});
    const returnResult = Map<BeerCollectionID, BeerCollection>().withMutations((map) => {
      for (const result of fuzzyResult) {
        const key = this.state.userCollectionList.keyOf(result.obj);
        if (!key) { continue ; }
        map.set(key, result.obj);
      }
    });
    this.setState({
      displayCollectionList: this.state.searchString.length === 0 ? this.state.userCollectionList : returnResult,
    });
  }
  private filterOnChangeHandler = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    await this.setState({
      searchType: event.target.value,
    });
  }
}
