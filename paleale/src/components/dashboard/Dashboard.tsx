import { Card, H3, Intent } from "@blueprintjs/core";
import { List, Map } from "immutable";
import React from "react";

import { BeerID } from "../../id";
import { BeerCollectionItem, DisplayBeerCollectionItem } from "../../model/beercollection";
import BeerService from "../../service/beer";
import BeerCollectionServices from "../../service/beercollection";
import AppToaster from "../common/apptoaster/AppToaster";
import BaseLayout from "../common/baselayout/BaseLayout";
import CircleIndicator from "../common/progress/CircleIndicator";

import ComingBeer from "./ComingBeer";
import StyleSummary from "./StyleSummary";
import Summary from "./Summary";

export interface DashboardStates {
  displayCollectionList: List<DisplayBeerCollectionItem>;
  isLoaded: boolean;
}

export default class CardExample extends React.PureComponent<{}, DashboardStates> {
  public state: DashboardStates = {
    displayCollectionList: {} as List<DisplayBeerCollectionItem>,
    isLoaded: false,
  };

  public componentDidMount = async () => {
    try {
      this.getFullBeerList();
    } catch {
      AppToaster.show({
        intent: Intent.DANGER,
        message: "Error while loading collection list",
      });
    }
  }

  public render() {
    const loader = (
      <div className="flex justify-center items-center">
        <CircleIndicator />
      </div>
    );
    return (
      <BaseLayout>
        <div className="flex flex-row flex-wrap flex-grow mt-2 w-auto mb-4">
          <div className=" flex p-3 w-6/12 sm: w-screen h-auto ml-auto md:w-6/12 lg:w-6/12">
            <Card className="w-full bg-white border-transparent rounded-lg shadow-lg">
              <div className="bg-grey-light uppercase text-grey-darkest border-b-2 border-grey rounded-tl-lg rounded-tr-lg p-2">
                <H3 className="uppercase text-grey-dark">Summary</H3>
              </div>
              {this.state.isLoaded ? <Summary displayCollectionList={this.state.displayCollectionList} /> : loader}
            </Card>
          </div>
          <div className="flex p-3 w-5/12 sm: w-screen h-auto mr-auto md:w-5/12 lg:w-5/12">
            <Card className="w-full bg-white border-transparent rounded-lg shadow-lg">
              <div className="bg-grey-light uppercase text-grey-darkest border-b-2 border-grey rounded-tl-lg rounded-tr-lg p-2">
                <H3 className="uppercase text-grey-dark">Styles breakdown</H3>
              </div>
              {this.state.isLoaded ? <StyleSummary displayCollectionList={this.state.displayCollectionList} /> : loader}
            </Card>
          </div>
          <div className="flex p-3 ml-32 mr-64 sm: ml-auto">
            <Card className="bg-white border-transparent rounded-lg shadow-lg">
              <div className="bg-grey-light uppercase text-grey-darkest border-b-2 border-grey rounded-tl-lg rounded-tr-lg p-2">
                <H3 className="uppercase text-grey-dark">Coming up beers</H3>
              </div>
              {this.state.isLoaded ? <ComingBeer displayCollectionList={this.state.displayCollectionList} /> : loader}
            </Card>
          </div>
        </div>
      </BaseLayout>
    );
  }

  private getFullBeerList = async () => {
    const rawCollectionList = await BeerCollectionServices.bulkGetAllUserBeerCollections();
    const beerCollectionItemList: BeerCollectionItem[] = [];
    rawCollectionList.collections.entrySeq().forEach((entry) => {
      entry[1].items.forEach((items) => {
        beerCollectionItemList.push(items);
      });
    });

    const idList = Map<BeerID, boolean>().withMutations((beerMap) => {
      beerCollectionItemList.forEach((entry) => {
        beerMap.set(entry.beerID, true);
      });
    }).keySeq().toList();
    const rawBeersData = await BeerService.bulkGetBeerByIDs({ beerIDs: idList });

    const displayCollectionItems = List<DisplayBeerCollectionItem>().withMutations((map) => {
      beerCollectionItemList.forEach((item) => {
        const beerData = rawBeersData.beers.get(item.beerID);
        if (!beerData) { return; }
        map.push({
          beerData,
          beerID: item.beerID,
          bestBeforeDate: item.bestBeforeDate,
          bottlesNumber: item.bottlesNumber,
          breweryData: undefined,
          purchaseDate: item.purchaseDate,
          purchaseDistributor: item.storageLocation,
          purchasePrice: item.purchasePrice,
          storageLocation: item.storageLocation,
        });
      });
    });
    this.setState({
      displayCollectionList: displayCollectionItems,
      isLoaded: true,
    });
  }
}
