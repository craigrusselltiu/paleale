import { Button, Classes, Intent, Overlay } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import React from "react";

import BeerCollectionServices from "../../../service/beercollection";

export interface CollectionDeleteProp {
    className?: string;
    listID: string;
    reloadParentList: () => void;
    deleteHandler: () => void;
}

export interface CollectionDeleteState {
    isOpen: boolean;
}

export default class CollectionDelete extends React.PureComponent<CollectionDeleteProp, CollectionDeleteState> {
    public state: CollectionDeleteState = {
        isOpen: false,
    };

    public render() {
        return (
            <div>
                <Button
                    className={this.props.className}
                    rightIcon={IconNames.CROSS}
                    intent={Intent.DANGER}
                    onClick={this.openStateHandler}
                >
                    Delete
                </Button>
                <Overlay
                    canEscapeKeyClose={true}
                    canOutsideClickClose={true}
                    className="flex h-full absolute h-screen items-center justify-center"
                    isOpen={this.state.isOpen}
                    lazy={true}
                    transitionName={Classes.OVERLAY_SCROLL_CONTAINER}
                    onClose={this.closeStateHandler}
                >
                    <div className="flex flex-col bg-white items-center px-5 py-8">
                        <h3 className="text-2xl text-orange-600">Are you sure?</h3>
                        <p>This will delete the chosen list from your collection.</p>
                        <p>This process cannot be reversed.</p>
                        <div className="pt-2">
                            <Button
                                className="px-2 mx-1"
                                intent={Intent.DANGER}
                                onClick={this.deleteListReload}
                            >
                                Yes
                            </Button>
                            <Button
                                className="px-2 mx-1"
                                onClick={this.closeStateHandler}
                            >
                                No
                            </Button>
                        </div>
                    </div>
                    {this.deleteListReload}
                </Overlay>
            </div>
        );
    }
    private deleteListReload = async () => {
        await BeerCollectionServices.deleteBeerCollectionByID({collectionID: this.props.listID});
        this.closeStateHandler();
        this.props.deleteHandler();
    }

    private openStateHandler = () => {
        this.setState({
            isOpen: true,
        });
    }

    private closeStateHandler = () => {
        this.setState({
            isOpen: false,
        });
    }
}
