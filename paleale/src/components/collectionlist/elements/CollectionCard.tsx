import { Card, Elevation } from "@blueprintjs/core";
import React from "react";

import { DisplayBeerCollection } from "../../../model/beercollection";
import CollectionPopup from "../../collection/CollectionPopup";

import "./_collection.css";

export interface CollectionCardProps {
    collectionID: string;
    collectionData: DisplayBeerCollection | undefined;
    className?: string;
    reloadParentList: () => void;
}

export interface CollectionCardStates {
    isOpen: boolean;
}

const defImg = "https://untappd.akamaized.net/site/assets/images/temp/badge-beer-default.png";

export default class CollectionCard extends React.Component<CollectionCardProps, CollectionCardStates> {
    public state: CollectionCardStates = {
        isOpen: false,
    };

    public render() {
        if (!this.props.collectionData) { return null; }
        let itemCount = 0;
        this.props.collectionData.items.forEach((item, _) => itemCount += item.bottlesNumber);
        return(
            <Card
                elevation={Elevation.ZERO}
                interactive={true}
                className="flex flex-col mx-5 my-8 min-w-64 w-1/6 h-84"
                onClick={this.openCollectionHandler}
            >
                <div className="flex flex-col w-full h-full pt-6 items-center text-center">
                    <img
                        className="w-24 h-24"
                        src={this.props.collectionData.displayImage ? this.props.collectionData.displayImage : defImg}
                        alt={this.props.collectionData.name}
                    />
                    <div className="flex flex-col items-center pt-6">
                        <h5 className="flex text-orange-600 text-lg">{this.props.collectionData.name}</h5>
                        <div className="max-h-20 mx-3 overflow-y-hidden break-all ">
                            <p className="pt-2 block-text-wrap">{this.props.collectionData.description}</p>
                        </div>
                        <p className="pt-1 w-56 truncate">Location: {this.props.collectionData.location}</p>
                        <p>Items: {itemCount}</p>
                    </div>
                </div>
                <CollectionPopup
                    collectionID={this.props.collectionID}
                    collectionData={this.props.collectionData}
                    isOpen={this.state.isOpen}
                    onClose={this.closeCollectionHandler}
                    reloadParentList={this.props.reloadParentList}
                />
            </Card>
        );
    }

    private openCollectionHandler = () => {
        this.setState({
            isOpen: true,
        });
    }

    private closeCollectionHandler = () => {
        this.setState({
            isOpen: false,
        });
    }
}
