import { Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { List } from "immutable";
import { DateTime } from "luxon";
import React from "react";

import { BeerCollection, BeerCollectionItem, DisplayBeerCollectionItem  } from "../../../model/beercollection";
import BeerCollectionServices from "../../../service/beercollection";

export interface CollectionItemGroupProps {
  collectionID: string;
  collectionItemGroup: List<DisplayBeerCollectionItem>;
  userCollection: BeerCollection;
  reloadCollectionItem: () => void;
}

export interface CollectionItemGroupStates {
  collectionItemGroup: List<DisplayBeerCollectionItem>;
}

export default class CollectionItemGroup extends React.PureComponent<
CollectionItemGroupProps, CollectionItemGroupStates> {
  public constructor(props: CollectionItemGroupProps) {
    super(props);
    this.state = {collectionItemGroup: this.props.collectionItemGroup};
  }

  public render() {
    return (
      <div className="px-10">
        {this.renderBeerInfo(this.state.collectionItemGroup)}
        {this.renderTable(this.state.collectionItemGroup)}
      </div>
    );
  }

  private renderBeerInfo(collectionItemGroup: List<DisplayBeerCollectionItem>) {
    const beerInfo = collectionItemGroup.get(0) || null;
    if (!beerInfo) {
      return null;
    }

    let totalBeer = 0;
    collectionItemGroup.forEach((item, _) => totalBeer += item.bottlesNumber);

    return (
      <div className="text-left mb-8">
        <div className="flex flex-row">
          <img
            alt={beerInfo.beerData.name}
            src={beerInfo.beerData.label}
            className="mb-2 h-24 w-24"
          />
          <div className="px-8 flex flex-row w-full justify-between">
            <div>
              <p className="text-3xl text-orange-600">{beerInfo.beerData.name}</p>
              <p className="text-xl">{beerInfo.breweryData ? beerInfo.breweryData.name : null}</p>
              <p className="truncate text-gray-700">{beerInfo.beerData.beerStyle}</p>
              <p className="mt-3 text-lg text-gray-500">{beerInfo.beerData.abv}% ABV</p>
            </div>
            <div>
              <p className="pt-5 text-xl">Total Quantity: {totalBeer}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private renderTable(collectionItemGroup: List<DisplayBeerCollectionItem>) {
    return (
      <div className="flex w-full justify-center items-center">
        <table className="bp3-html-table .modifier w-full">
          <thead>
            <tr>
              <th>Purchase Price</th>
              <th>Purchase Date</th>
              <th>Best Before Date</th>
              <th>Distributor</th>
              <th>Storage Location</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {this.renderTableBody(collectionItemGroup)}
          </tbody>
        </table>
      </div>
    );
  }

  private renderTableBody(collectionItemGroup: List<DisplayBeerCollectionItem>) {
    const renderExpandedCollection = collectionItemGroup.map((value, index) => (
      <tr key={index}>
        <td>$ {value.purchasePrice}</td>
        <td>{value.purchaseDate ? this.formatDate(value.purchaseDate) : null}</td>
        <td>{value.bestBeforeDate ? this.formatDate(value.bestBeforeDate) : null}</td>
        <td>{value.purchaseDistributor}</td>
        <td>{value.storageLocation}</td>
        <td>{value.bottlesNumber}</td>
        <td className="flex flex-row w-12 mr-4">
          <Button
            icon={IconNames.CROSS}
            intent={Intent.DANGER}
            onClick={this.deleteItemHandler(index)}
          />
        </td>
      </tr>
    ));

    return (
      renderExpandedCollection
    );
  }

  private deleteItemHandler = (index: number) => async () => {
    const deletedItem = this.state.collectionItemGroup.get(index) || null;
    if (!deletedItem) { return; }
    const newDisplayCollectionGroup = List<DisplayBeerCollectionItem>().withMutations((list) => {
      this.state.collectionItemGroup.forEach((item, _) => {
        if (JSON.stringify(item) !== JSON.stringify(deletedItem)) {
          list.push(item);
        }
      });
    });

    this.setState({ collectionItemGroup: newDisplayCollectionGroup });

    const userCollection = await BeerCollectionServices.getBeerCollectionByID({collectionID: this.props.collectionID});

    const deletedItemInfo: BeerCollectionItem = {
      beerID: deletedItem.beerID,
      bestBeforeDate: deletedItem.bestBeforeDate,
      bottlesNumber: deletedItem.bottlesNumber,
      purchaseDate: deletedItem.purchaseDate,
      purchaseDistributor: deletedItem.purchaseDistributor,
      purchasePrice: deletedItem.purchasePrice,
      storageLocation: deletedItem.storageLocation,
    };

    const newUserCollectionItems = List<BeerCollectionItem>().withMutations((list) => {
      userCollection.collection.items.forEach((item, _) => {
        if (JSON.stringify(item) !== JSON.stringify(deletedItemInfo)) {
          list.push(item);
        }
      });
    });

    userCollection.collection.items = newUserCollectionItems;

    await BeerCollectionServices.updateBeerCollection({
      collection: userCollection.collection,
      collectionID: this.props.collectionID,
    });

    await this.props.reloadCollectionItem();
  }

  private formatDate(date: DateTime) {
    return `${date.daysInMonth}/${date.month}/${date.year}`;
  }
}
