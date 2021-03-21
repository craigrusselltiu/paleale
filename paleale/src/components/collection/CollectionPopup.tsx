import { Button, Card, Classes, Elevation, Intent, Overlay } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { List , Map} from "immutable";
import React from "react";

import { BeerID, BreweryID } from "../../id";
import { DisplayBeerCollection, DisplayBeerCollectionItem } from "../../model/beercollection";
import BeerServices from "../../service/beer";
import BeerCollectionServices from "../../service/beercollection";
import BreweryServices from "../../service/brewery";
import CollectionDelete from "../collectionlist/elements/CollectionDelete";
import AppToaster from "../common/apptoaster/AppToaster";
import CircleIndicator from "../common/progress/CircleIndicator";
import Search from "../search/Search";

import CollectionItemGroup from "./elements/CollectionItemGroup";

export interface CollectionPopupProps {
  collectionID: string;
  collectionData: DisplayBeerCollection;
  isOpen: boolean;
  onClose: () => void;
  reloadParentList: () => void;
}

export interface CollectionPopupStates {
  collectionData: DisplayBeerCollection;
  expandedGroupBeerID: string;
  groupedCollection: Map<BeerID , List<DisplayBeerCollectionItem>>;
  isItemLoaded: boolean;
  isOpenSearch: boolean;
  isRenderGroup: boolean;
}

export default class CollectionPopup extends React.PureComponent<CollectionPopupProps, CollectionPopupStates> {
  public constructor(props: CollectionPopupProps) {
    super(props);
    this.state = {
      collectionData: {
        description: "",
        displayImage: "",
        items: List<DisplayBeerCollectionItem>(),
        location: "",
        name: "",
        notes: "",
        tags: List<string>(),
      },
      expandedGroupBeerID: "",
      groupedCollection: Map<BeerID , List<DisplayBeerCollectionItem>>(),
      isItemLoaded: false,
      isOpenSearch: false,
      isRenderGroup: false,
    };
  }

  public async componentDidMount() {
    try {
      await this.setState({
        collectionData: this.props.collectionData,
      });
      this.groupByBeerID(this.state);
    } catch {
      AppToaster.show({
        intent: Intent.DANGER,
        message: "Error while loading sample beer",
      });
    }
  }

  public render() {
    return (
      <div className="pl-8">
        <Overlay
          className={`${Classes.OVERLAY_SCROLL_CONTAINER} flex h-screen absolute justify-center`}
          isOpen={this.props.isOpen}
          onClose={this.closeHandler}
          transitionName={Classes.OVERLAY_SCROLL_CONTAINER}
        >
          <Card className="w-9/12 text-center my-40 pb-10" elevation={Elevation.FOUR}>
            {!this.state.isRenderGroup ? this.renderCollection() : this.renderExpandedGroup(this.state)}
          </Card>
        </Overlay>
      </div>
    );
  }

  private renderExpandedGroup(state: CollectionPopupStates) {
    const expandedGroup = state.groupedCollection.get(state.expandedGroupBeerID) || List<DisplayBeerCollectionItem>();
    return (
      <div>
        <div className="flex justify-between">
          <Button
              className="focus:outline-none"
              icon={IconNames.ARROW_LEFT}
              minimal={true}
              onClick={this.switchToListView}
          />
          <Button
              className="focus:outline-none"
              icon={IconNames.CROSS}
              minimal={true}
              onClick={this.closeHandler}
          />
        </div>
        <CollectionItemGroup
          collectionID={this.props.collectionID}
          collectionItemGroup={expandedGroup}
          userCollection={this.state.collectionData}
          reloadCollectionItem={this.reloadCollection}
        />
      </div>
    );
  }

  private renderCollection = () => {
    const loader = (
      <div className="flex h-full w-full justify-center items-center">
        <CircleIndicator/>
      </div>
    );

    return(
      <div>
        <div className="flex justify-end">
          <Button
            text="Add Beer"
            className="mr-2"
            intent={Intent.WARNING}
            rightIcon={IconNames.PLUS}
            onClick={this.openSearchHandler}
          />
          <Button
              className="focus:outline-none"
              icon={IconNames.CROSS}
              minimal={true}
              onClick={this.closeHandler}
          />
        </div>
        <p className="text-4xl pb-4 font-semibold">{this.props.collectionData.name}</p>
        <p className="text-lg pb-6 px-40">Location: {this.props.collectionData.location}</p>
        <p className="font-thin pb-12 px-40">{this.props.collectionData.description}</p>
        {this.state.isItemLoaded ? this.renderCollectionList() : loader}
        <div className="flex justify-end mt-10">
          <CollectionDelete
            reloadParentList={this.props.reloadParentList}
            listID={this.props.collectionID}
            deleteHandler={this.closeHandler}
          />
        </div>
        <Search
          collectionID={this.props.collectionID}
          isOpen={this.state.isOpenSearch}
          onClose={this.closeSearchHandler}
          reloadCollectionItem={this.reloadCollection}
        />
      </div>
    );
  }

  private renderCollectionList = () => {
    if (!Map.isMap(this.state.groupedCollection)) { return null; }
    const renderList = this.state.groupedCollection.map((item, index) => {
      const groupInfo = item.get(0);
      if (!groupInfo) {
        return null;
      }
      let itemCount = 0;
      item.forEach((beerItem, _) => itemCount += beerItem.bottlesNumber);
      return (
        <Card
          key={index}
          elevation={Elevation.ZERO}
          interactive={true}
          onClick={this.selectGroupByBeerID.bind(this, groupInfo.beerID)}
          className="flex flex-col text-gray-600 w-56 h-auto m-2 justify-center items-center"
        >
          <img
            alt={groupInfo.beerData.name}
            src={groupInfo.beerData.label}
            className="mb-2 h-24 w-24"
          />
          <p className="truncate w-full text-lg text-orange-600">{groupInfo.beerData.name}</p>
          <p className="truncate text-black w-full">{groupInfo.breweryData ? groupInfo.breweryData.name : "Unknown"}</p>
          <p className="truncate w-full">{groupInfo.beerData.beerStyle}</p>
          <p className="mt-2">{groupInfo.beerData.abv}% ABV</p>
          <p className="truncate w-full">Items: {itemCount}</p>
        </Card>
      );
    });
    return(
      <div className="flex flex-row flex-wrap justify-center">
        {renderList ? renderList.valueSeq().toList() : null}
      </div>
    );
  }

  private groupByBeerID(state: CollectionPopupStates) {
    const beerMapFilter = Map<BeerID, DisplayBeerCollectionItem[]>().withMutations((map) => {
      state.collectionData.items.forEach((item) => {
        const tmpArray = map.get(item.beerID) || [];
        tmpArray.push(item);
        map.set(item.beerID, tmpArray);
      });
    });

    const beerMapDisplay = Map<BeerID, List<DisplayBeerCollectionItem>>().withMutations((map) => {
      beerMapFilter.forEach((item, key) => {
        map.set(key, List(item));
      });
    });
    state.groupedCollection = beerMapDisplay;
    state.isItemLoaded = true;
  }

  private selectGroupByBeerID(beerID: string) {
    this.setState({
      expandedGroupBeerID: beerID,
      isRenderGroup: true,
    });
  }

  private getFullCollectionItemList = async () => {
    const userCollection = await BeerCollectionServices.getBeerCollectionByID({collectionID: this.props.collectionID});
    const beerIDList = Map<BeerID, boolean>().withMutations((map) => {
      userCollection.collection.items.forEach((item) => {
        map.set(item.beerID, true);
      });
    }).keySeq().toList();

    const allBeerInfo = await BeerServices.bulkGetBeerByIDs({beerIDs: beerIDList});
    const breweryIDList = Map<BreweryID, boolean>().withMutations((map) => {
      allBeerInfo.beers.forEach((item) => {
        map.set(item.breweryID, true);
      });
    }).keySeq().toList();
    const allBreweryInfo = await BreweryServices.bulkGetBreweryByIDs({breweryIDs: breweryIDList});
    const displayCollectionItems = List<DisplayBeerCollectionItem>().withMutations((map) => {
      userCollection.collection.items.forEach((item) => {
        const beerData = allBeerInfo.beers.get(item.beerID);
        if (!beerData) { return; }
        const breweryData = allBreweryInfo.breweries.get(beerData.breweryID);
        map.push({
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
    this.state.collectionData.items = displayCollectionItems;
  }

  private reloadCollection = async () => {
    await this.getFullCollectionItemList();
    this.groupByBeerID(this.state);
  }

  private closeHandler = async () => {
    this.setState({
      isRenderGroup: false,
    });
    await this.props.onClose();
    this.props.onClose();
    this.props.reloadParentList();
  }

  private openSearchHandler = () => {
    this.setState({
      isOpenSearch: true,
    });
  }

  private closeSearchHandler = () => {
    this.setState({
      isOpenSearch: false,
    });
  }

  private switchToListView = () => {
    this.setState({
      expandedGroupBeerID: "",
      isRenderGroup: false,
    });
  }
}
