import { Button, Classes, InputGroup, Intent, Overlay } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { List } from "immutable";
import React from "react";

import { BeerCollectionItem } from "../../../model/beercollection";
import BeerCollectionServices from "../../../service/beercollection";

export interface CollectionAddProp {
    reloadParentList: () => void;
}

export interface CollectionAddState {
    isOpen: boolean;
    newCollectionName: string;
    newCollectionNameIsEmpty: boolean;
    newCollectionDescription: string;
    newCollectionTags: List<string>;
    newCollectionLocation: string;
    newCollectionLocationIsEmpty: boolean;
    newCollectionNotes: string;
}

export default class CollectionAdd extends React.PureComponent<CollectionAddProp, CollectionAddState> {
    public state: CollectionAddState = {
        isOpen: false,
        newCollectionDescription: "",
        newCollectionLocation: "",
        newCollectionLocationIsEmpty: false,
        newCollectionName: "",
        newCollectionNameIsEmpty: false,
        newCollectionNotes: "",
        newCollectionTags: List<string>(),
    };

    public render() {
        const emptyName = <p className="text-red-700 pb-1 text-sm justify-end">Name cannot be empty</p>;
        const emptyLocation = <p className="text-red-700 pb-1 text-sm justify-end">Location cannot be empty</p>;

        return (
            <div>
                <Button text="New collection" onClick={this.openStateHandler}/>
                <Overlay
                    canEscapeKeyClose={true}
                    canOutsideClickClose={true}
                    className="flex h-full absolute h-screen items-center justify-center"
                    isOpen={this.state.isOpen}
                    lazy={true}
                    transitionName={Classes.OVERLAY_SCROLL_CONTAINER}
                    onClose={this.closeStateHandler}
                >
                    <div className="flex flex-col h-auto w-96 min-w-96 bg-white items-center mx-6 py-8">
                        <Button
                            className="flex absolute top-0 right-0 mx-2 my-2 focus:outline-none"
                            icon={IconNames.CROSS}
                            minimal={true}
                            onClick={this.closeStateHandler}
                        />
                        <h1 className="text-orange-600 text-2xl pt-3">New Collection</h1>
                        <div className="flex flex-row w-full px-6">
                            <div className="flex flex-col w-48 my-10 justify-between">
                                <h5>Collection Name:</h5>
                                <h5>Collection Location:</h5>
                                <h5>Collection Description:</h5>
                                <h5>Collection Notes:</h5>
                            </div>
                            <div className="flex flex-col w-48 py-4">
                                <InputGroup
                                    className={this.state.newCollectionNameIsEmpty ? "pt-4" : "py-4"}
                                    intent={this.state.newCollectionNameIsEmpty ? Intent.DANGER : Intent.NONE}
                                    placeholder="Collection name.."
                                    onChange={this.nameInputHandler}
                                    value={this.state.newCollectionName}
                                />
                                {this.state.newCollectionNameIsEmpty ? emptyName : null}
                                <InputGroup
                                    className={this.state.newCollectionLocationIsEmpty ? "pt-2" : "py-4"}
                                    intent={this.state.newCollectionLocationIsEmpty ? Intent.DANGER : Intent.NONE}
                                    placeholder="Collection location.."
                                    onChange={this.locationInputHandler}
                                    value={this.state.newCollectionLocation}
                                />
                                {this.state.newCollectionLocationIsEmpty ? emptyLocation : null}
                                <InputGroup
                                    className="py-4"
                                    placeholder="Collection description.."
                                    onChange={this.descriptionInputHandler}
                                    value={this.state.newCollectionDescription}
                                />
                                <InputGroup
                                    className="py-4"
                                    placeholder="Collection notes.."
                                    onChange={this.notesInputHandler}
                                    value={this.state.newCollectionNotes}
                                />
                            </div>
                        </div>
                        <Button intent={Intent.SUCCESS} onClick={this.addButtonHandler}>Add</Button>
                    </div>
                </Overlay>
            </div>
        );
    }

    private addButtonHandler = async () => {
        let validInput = true;
        if (this.state.newCollectionName === "") {
            this.setState({ newCollectionNameIsEmpty: true });
            validInput = false;
        }
        if (this.state.newCollectionLocation === "") {
            this.setState({ newCollectionLocationIsEmpty: true });
            validInput = false;
        }
        if (!validInput) { return; }
        const beerAddModel = {
            description: this.state.newCollectionDescription,
            items: List<BeerCollectionItem>(),
            location: this.state.newCollectionLocation,
            name: this.state.newCollectionName,
            notes: this.state.newCollectionNotes,
            tags: this.state.newCollectionTags,
        };
        await BeerCollectionServices.addBeerCollection({collection: beerAddModel});
        await this.setState({
            isOpen: false,
            newCollectionDescription: "",
            newCollectionLocation: "",
            newCollectionName: "",
            newCollectionNotes: "",
        });
        this.props.reloadParentList();
    }

    private nameInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            newCollectionName: event.target.value,
            newCollectionNameIsEmpty: false,
        });
    }

    private locationInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            newCollectionLocation: event.target.value,
            newCollectionLocationIsEmpty: false,
        });
    }

    private descriptionInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            newCollectionDescription: event.target.value,
        });
    }

    private notesInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            newCollectionNotes: event.target.value,
        });
    }

    private openStateHandler = () => {
        this.setState({
            isOpen: true,
        });
    }

    private closeStateHandler = () => {
        this.setState({
            isOpen: false,
            newCollectionDescription: "",
            newCollectionLocation: "",
            newCollectionName: "",
            newCollectionNotes: "",
        });
    }
}
