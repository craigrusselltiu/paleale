import {
  Button,
  Classes,
  InputGroup,
  Intent,
  NumericInput,
  Popover,
  PopoverInteractionKind,
  Position,
  Toaster,
} from "@blueprintjs/core";
import { DateInput } from "@blueprintjs/datetime";
import { IconNames } from "@blueprintjs/icons";
import * as FuzzySort from "fuzzysort";
import { List, Map } from "immutable";
import { DateTime } from "luxon";
import React, { ChangeEvent } from "react";
import AutoSuggest from "react-autosuggest";

import { Beer } from "../../../model/beer";
import { BeerCollection, BeerCollectionItem } from "../../../model/beercollection";
import BeerService from "../../../service/beer";
import BeerCollectionServices from "../../../service/beercollection";

export interface SearchAddProps {
  beerData: Beer;
  beerID: string;
  collectionID: string;
  reloadCollectionItem: () => void;
}

export interface SearchAddStates {
  bottlesNumber: number;
  isOpen: boolean;
  isNewVariation: boolean;
  showVariation: boolean;
  variation: string;
  newStyle: string;
  newABV: number;
  newABVIsInvalid: boolean;
  bestBeforeDate: DateTime | undefined;
  purchaseDate: DateTime | undefined;
  storageLocation: string;
  purchaseDistributor: string;
  purchasePrice: number;
  displayPrice: string;
  displayPricePrev: string;
  priceIsValid: boolean;
  suggestion: string[];
  possibleLocation: List<string>;
}

const Notification = Toaster.create({
  position: Position.TOP,
});

export default class SearchAdd extends React.PureComponent<SearchAddProps, SearchAddStates> {
  public state: SearchAddStates = {
    bestBeforeDate: DateTime.fromISO("0000-01-01T09:08:34.123"),
    bottlesNumber: 1,
    displayPrice: "",
    displayPricePrev: "",
    isNewVariation: false,
    isOpen: false,
    newABV: 0,
    newABVIsInvalid: false,
    newStyle: "",
    possibleLocation: List<string>(),
    priceIsValid: true,
    purchaseDate: DateTime.fromISO("0000-01-01T09:08:34.123"),
    purchaseDistributor:  "",
    purchasePrice: 0.00,
    showVariation: false,
    storageLocation: "",
    suggestion: [],
    variation: "",
  };

  public render() {
    const maxDate = new Date("December 31, 2200 23:59:59");
    const suggestionProps = {
      onChange: this.storageLocationHandler,
      placeholder: "Location...",
      value: this.state.storageLocation,
    };

    const suggestionTheme = {
      container: `${Classes.INPUT_GROUP} my-2`,
      input: Classes.INPUT,
      inputOpen: "rounded-br-none rounded-br-none",
      suggestion: "cursor-pointer px-3 py-2",
      suggestionHighlighted: "bg-blue-600",
      suggestionsContainerOpen: "block absolute shadow bg-white w-full rounded-br-sm rounded-br-sm z-20",
    };

    const addOptions = (
      <div className="flex flex-row">
        <div className="flex flex-col my-5 w-32 justify-between">
          <h5>Storage location:</h5>
          <h5>Distributor:</h5>
          <h5>Price:</h5>
          <h5>Amount:</h5>
          <h5>Purchase date:</h5>
          <h5>Best before date:</h5>
        </div>
        <div className="flex flex-col my-2 w-32">
          <AutoSuggest
            suggestions={this.state.suggestion}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={this.getSuggestionValue}
            renderSuggestion={this.renderSuggestion}
            inputProps={suggestionProps}
            theme={suggestionTheme}
          />
          <InputGroup
            className="my-2"
            fill={true}
            placeholder="Distributor..."
            onChange={this.purchaseDistributorHandler}
            value={this.state.purchaseDistributor}
          />
          <InputGroup
            className="my-2"
            fill={true}
            placeholder="Price..."
            onChange={this.purchasePriceHandler}
            value={this.state.displayPrice}
            leftIcon={IconNames.DOLLAR}
          />
          <NumericInput
            className="my-2"
            allowNumericCharactersOnly={true}
            min={1}
            fill={true}
            placeholder="Amount..."
            onValueChange={this.bottlesNumberHandler}
            value={this.state.bottlesNumber}
            stepSize={1}
          />
          <DateInput
            className="my-2"
            maxDate={maxDate}
            placeholder="Not set"
            formatDate={this.formatDate}
            onChange={this.purchaseDateHandler}
            parseDate={this.parseDate}
            popoverProps={{ position: Position.BOTTOM }}
          />
          <DateInput
            className="my-2"
            maxDate={maxDate}
            placeholder="Not set"
            formatDate={this.formatDate}
            onChange={this.bestBeforeDateHandler}
            parseDate={this.parseDate}
            popoverProps={{ position: Position.BOTTOM }}
          />
        </div>
      </div>
    );

    const makeVariationOptions = (
      <div className="flex flex-row">
        <div className="flex flex-col my-5 w-32 justify-between">
          <h5>Variation:</h5>
          <h5>Beer Style:</h5>
        </div>
        <div className="flex flex-col my-2 w-32">
          <InputGroup
            className="my-2"
            fill={true}
            placeholder="Variation..."
            onChange={this.variationNameHandler}
            value={this.state.variation}
          />
          <InputGroup
            className="my-2"
            fill={true}
            placeholder={this.props.beerData.beerStyle}
            onChange={this.variationStyleHandler}
            value={this.state.newStyle}
          />
        </div>
      </div>
    );

    return(
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        position={Position.BOTTOM}
        isOpen={this.state.isOpen}
        onClose={this.closeStateHandler}
      >
        <Button icon={IconNames.PLUS} intent={Intent.WARNING} onClick={this.openStateHandler}/>
        <div className="flex flex-col w-96 h-auto py-4 px-4 justify-center items-center">
          <Button
              className="flex absolute top-0 right-0 mx-2 my-2 focus:outline-none"
              icon={IconNames.CROSS}
              minimal={true}
              onClick={this.closeStateHandler}
          />
          <h5 className="text-center text-lg text-orange-600">Add Beer</h5>
          {this.state.showVariation ? makeVariationOptions : addOptions}
          <div className="flex-end">
            <Button className="mr-2" intent={Intent.SUCCESS} onClick={this.addBeerToCollection}>Add</Button>
            <Button onClick={this.toggleNewVariation}>{this.state.showVariation ? "Back" : "Make Variation"}</Button>
          </div>
        </div>
      </Popover>
    );
  }

  private formatDate(date: Date): string {
    const formatOption = {year: "numeric", month: "long", day: "numeric"};
    const locale = "EN-UK";
    return date.toLocaleDateString(locale, formatOption);
  }

  private parseDate(dateString: string): Date {
    return new Date(dateString);
  }

  private addBeerToCollection = async () => {
    const collection = await BeerCollectionServices.getBeerCollectionByID({collectionID: this.props.collectionID});
    if (!collection.collection) {
      this.displayFailure();
      return;
    }

    let newVariationID = "";
    if (this.state.variation === "") {
      this.setState({
        isNewVariation: false,
      });
    }

    if (this.state.isNewVariation) {
      const newBeerVariation: Beer = {
        abv: this.props.beerData.abv,
        beerStyle: this.state.newStyle === "" ? this.props.beerData.beerStyle : this.state.newStyle,
        breweryID: this.props.beerData.breweryID,
        ibu: this.props.beerData.ibu,
        isInProduction: this.props.beerData.isInProduction,
        label: this.props.beerData.label,
        name: `${this.props.beerData.name} ${this.state.variation}`,
      };

      newVariationID = (await BeerService.addBeer({beer: newBeerVariation})).beerID;
    }

    const newCollectionItem: BeerCollectionItem = {
      beerID: newVariationID === "" ? this.props.beerID : newVariationID,
      bestBeforeDate: this.state.bestBeforeDate,
      bottlesNumber: this.state.bottlesNumber,
      purchaseDate: this.state.purchaseDate,
      purchaseDistributor:  this.state.purchaseDistributor,
      purchasePrice: this.state.purchasePrice,
      storageLocation: this.state.storageLocation,
    };
    const updatedBeerCollection: BeerCollection = {
      description: collection.collection.description,
      items: collection.collection.items.push(newCollectionItem),
      location: collection.collection.location,
      name: collection.collection.name,
      notes: collection.collection.notes,
      tags: collection.collection.tags,
    };
    await BeerCollectionServices.updateBeerCollection({
      collection: updatedBeerCollection,
      collectionID: this.props.collectionID,
    });
    this.closeStateHandler();
    this.displaySuccess();
    this.props.reloadCollectionItem();
  }

  private async getPossibleLocation(props: SearchAddProps, state: SearchAddStates) {
    const userCollection = await BeerCollectionServices.getBeerCollectionByID({collectionID: props.collectionID});
    const locationList = Map<string, boolean>().withMutations((map) => {
      userCollection.collection.items.forEach((item, _) => {
        map.set(item.storageLocation, true);
      });
    }).keySeq().toList();
    state.possibleLocation = locationList;
  }

  private openStateHandler = async () => {
    await this.getPossibleLocation(this.props, this.state);
    this.setState({
      isOpen: true,
    });
  }

  private closeStateHandler = () => {
    this.setState({
      bottlesNumber: 1,
      displayPrice: "",
      displayPricePrev: "",
      isNewVariation: false,
      isOpen: false,
      newStyle: "",
      priceIsValid: true,
      purchaseDistributor:  "",
      purchasePrice: 0.00,
      showVariation: false,
      storageLocation: "",
      variation: "",
    });
  }

  private purchaseDateHandler = (selectedDate: Date, isUserChange: boolean) => {
    if (isUserChange) {
      this.setState({
        purchaseDate: DateTime.fromJSDate(selectedDate),
      });
    }
  }

  private bestBeforeDateHandler = (selectedDate: Date, isUserChange: boolean) => {
    if (isUserChange) {
      this.setState({
        bestBeforeDate: DateTime.fromJSDate(selectedDate),
      });
    }
  }

  private bottlesNumberHandler = (valueAsNumber: number, valueAsString: string) => {
    this.setState({
      bottlesNumber: valueAsNumber,
    });
  }

  private purchaseDistributorHandler = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      purchaseDistributor: event.target.value,
    });
  }

  private purchasePriceHandler = (event: ChangeEvent<HTMLInputElement>) => {
    let stringIsNumber = true;
    if (event.target.value === "") {
      this.setState({
        displayPrice: "",
        displayPricePrev: "",
        priceIsValid: true,
        purchasePrice: 0.00,
      });
      return;
    }
    let dotCount = 0;
    for (const c of event.target.value) {
      if (c === ".") { dotCount += 1; }
      if (dotCount > 1) {
        stringIsNumber = false;
        break;
      } else if (dotCount === 1 && event.target.value.length === 1) {
        stringIsNumber = false;
        break;
      }
    }
    if (event.target.value[event.target.value.length - 1] !== "." &&
      Number.isNaN(Number.parseInt(event.target.value[event.target.value.length - 1], 10))) {
        stringIsNumber = false;
    }
    if (!stringIsNumber) {
      this.setState({
        displayPrice: this.state.displayPricePrev,
        priceIsValid: false,
        purchasePrice: 0.00,
      });
      return;
    }
    const price = Math.round(Number.parseFloat(event.target.value) * 100) / 100;
    this.setState({
      displayPrice: event.target.value,
      displayPricePrev: event.target.value,
      priceIsValid: true,
      purchasePrice: price,
    });
  }

  private storageLocationHandler = (event: ChangeEvent<HTMLInputElement>, {newValue}: { newValue: string }) => {
    this.setState({
      isNewVariation: true,
      storageLocation: newValue,
    });
  }

  private onSuggestionsFetchRequested = (input: any) => {
    this.setState({suggestion: FuzzySort.go(input.value,
      this.state.possibleLocation.toArray()).map((result) => result.target)});
  }

  private onSuggestionsClearRequested = () => {
    this.setState({suggestion: []});
  }

  private renderSuggestion(suggestion: string) {
    return (
      <span>{suggestion}</span>
    );
  }

  private getSuggestionValue = (suggestion: string) => {
    return suggestion;
  }

  private variationNameHandler = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      isNewVariation: true,
      variation: event.target.value,
    });
  }

  private variationStyleHandler = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      isNewVariation: true,
      newStyle: event.target.value,
    });
  }

  private toggleNewVariation = () => {
    if (!this.state.showVariation) {
      this.setState({
        showVariation: true,
      });
    } else {
      if (this.state.variation === "") {
        this.setState({
          isNewVariation: false,
          newStyle: "",
        });
      }
      this.setState({
        showVariation: false,
      });
    }
  }

  private displaySuccess() {
    Notification.show({ intent: Intent.SUCCESS, message: "Beer added." });
  }

  private displayFailure() {
    Notification.show({ intent: Intent.DANGER, message: "Beer could not be added." });
  }
}
