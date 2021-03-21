import React from "react";

import { BeerIDAndModel } from "../../../service/beer";

import SearchAdd from "./SearchAdd";

export interface SearchCardProps {
  beer: BeerIDAndModel;
  collectionID: string;
  reloadCollectionItem: () => void;
}

export default class SearchCard extends React.PureComponent<SearchCardProps, {}> {
  public render() {
    return(
      <div className="flex flex-row w-full h-auto py-4">
        <img className="h-16 w-16" src={this.props.beer.model.label} alt={this.props.beer.model.name}/>
        <div className="flex flex-row justify-between w-full px-8">
          <div className="flex flex-col">
            <h1>{this.props.beer.model.name}</h1>
            <h1>{this.props.beer.model.beerStyle}</h1>
          </div>
          <div>
            <h1>{this.props.beer.model.abv} ABV</h1>
          </div>
          <SearchAdd
            beerData={this.props.beer.model}
            beerID={this.props.beer.id}
            collectionID={this.props.collectionID}
            reloadCollectionItem={this.props.reloadCollectionItem}
          />
        </div>
      </div>
    );
  }
}
