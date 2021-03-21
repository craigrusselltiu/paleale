import {
    Button,
    Classes,
    HTMLSelect,
    InputGroup,
    Intent,
    NonIdealState,
    Overlay,
    Position,
    Toaster,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { List } from "immutable";
import React from "react";

import BeerService, { BeerIDAndModel } from "../../service/beer";
import ProfileService from "../../service/profile";
import CircleIndicator from "../common/progress/CircleIndicator";

import SearchCard from "./elements/SearchCard";

export interface SearchProps {
    collectionID: string;
    isOpen: boolean;
    onClose: () => void;
    reloadCollectionItem: () => void;
}

export interface SearchState {
    hasSearched: boolean;
    isLoaded: boolean;
    isUntapped: boolean;
    query: string;
    searchString: string;
    searchStringAlternative: string;
    searchResult: List<BeerIDAndModel>;
}

const Notification = Toaster.create({
    position: Position.TOP,
});

const SEARCH_OPTIONS = [
    {label: "Normal", value: "false"},
    {label: "Untappd", value: "true"},
];

export default class Search extends React.PureComponent<SearchProps, SearchState> {
    public state: SearchState = {
        hasSearched: false,
        isLoaded: true,
        isUntapped: false,
        query: "",
        searchResult: List<BeerIDAndModel>(),
        searchString: "",
        searchStringAlternative: "",
    };
    public render() {
        const searchButton = (
            <Button icon={IconNames.SEARCH} intent={Intent.SUCCESS} onClick={this.searchButtonHandler}/>
        );

        return(
            <Overlay
                autoFocus={false}
                className={`${Classes.OVERLAY_SCROLL_CONTAINER} flex h-screen absolute justify-center`}
                isOpen={this.props.isOpen}
                onClose={this.closeStateHandler}
                transitionName={Classes.OVERLAY_SCROLL_CONTAINER}
            >
                <div className="absolute w-6/12 px-4 py-12 my-64 bg-white flex flex-col items-center justify-center">
                    <h5 className="mb-10 text-2xl">Search Beer</h5>
                    <Button
                        className="flex absolute top-0 right-0 mx-2 my-2 focus:outline-none"
                        icon={IconNames.CROSS}
                        minimal={true}
                        onClick={this.closeStateHandler}
                    />
                    <div className="flex w-full flex-row px-4">
                        <InputGroup
                            autoFocus={true}
                            fill={true}
                            placeholder="Search for beer..."
                            onChange={this.searchInputHandler}
                            value={this.state.searchString}
                            rightElement={searchButton}
                            onKeyPress={this.keyPressHandler}
                        />
                        <HTMLSelect
                            className="min-w-32 mx-2"
                            onChange={this.filterOnChangeHandler}
                            options={SEARCH_OPTIONS}
                            value={this.state.isUntapped.toString()}
                        />
                    </div>
                    <div className="w-full my-6">
                        {this.renderSearch()}
                    </div>
                </div>
            </Overlay>
        );
    }

    private renderSearch = () => {
        const resolvetoUntappd = async () => {
            await this.setState({
                hasSearched: false,
                isUntapped: true,
            });
            this.searchButtonHandlerAlternative();
        };

        const loading = (
            <div className="flex w-full h-full my-10 justify-center items-center">
                <CircleIndicator />
            </div>
        );

        const untappdButton = (
            <div>
                <InputGroup
                    className={Classes.ROUND}
                    placeholder="Search..."
                    onChange={this.searchInputHandlerAlternative}
                    value={this.state.searchStringAlternative}
                />
                <Button
                    className="mt-4"
                    intent={Intent.PRIMARY}
                    onClick={resolvetoUntappd}
                >
                    Search
                </Button>
            </div>
        );
        if (!this.state.isLoaded) { return loading; }
        if (!List.isList(this.state.searchResult)) { return null; }
        if (this.state.searchResult.size === 0) {
            if (!this.state.hasSearched) { return null; }
            if (this.state.isUntapped) {
                return (
                    <NonIdealState
                        icon={IconNames.SEARCH}
                        title="Beer not found"
                        description="We could not find the beer you requested on Untappd. You can try searching for something else."
                    />
                );
            }
            return (
                <NonIdealState
                    icon={IconNames.SEARCH}
                    title="Beer not found"
                    description="We could not find the beer you requested on our database. You can try searching for something else or switch to searching on Untappd."
                    action={untappdButton}
                />
            );
        }
        const searchCardRenderList = this.state.searchResult.map((item, index) => (
            <SearchCard
                collectionID={this.props.collectionID}
                beer={item}
                key={index}
                reloadCollectionItem={this.props.reloadCollectionItem}
            />
        ));

        return searchCardRenderList;
    }

    private async isUntappdConnected(state: SearchState): Promise<boolean> {
        if (state.isUntapped && !(await ProfileService.getProfile()).isConnectedWithUntappd) {
            Notification.show({ intent: Intent.DANGER, message: "You are not connected with to Untappd yet.\nUntappd can be connected in you user profile." });
            return false;
        }
        return true;
    }

    private searchButtonHandler = async () => {
        await this.setState({ isLoaded: false });
        await this.searchHandler();
        await this.setState({ isLoaded: true });
    }

    private searchHandler = async () => {
        let searchResult = {} as List<BeerIDAndModel>;
        if (this.state.isUntapped) {
            if (!(await this.isUntappdConnected(this.state))) {
                await this.setState({
                    hasSearched: false,
                    isUntapped: false,
                    searchString: "",
                });
                return;
            }
            searchResult = (await BeerService.searchBeersUntappd({phrase: this.state.searchString})).beers;
        } else {
            searchResult = (await BeerService.searchBeersDB({phrase: this.state.searchString})).beers;
        }
        await this.setState({
            hasSearched: true,
            searchResult,
            searchString: "",
        });
        if (this.props.reloadCollectionItem) { this.props.reloadCollectionItem(); }
    }

    private searchButtonHandlerAlternative = async () => {
        await this.setState({ isLoaded: false });
        await this.searchHandlerAlternative();
        await this.setState({ isLoaded: true });
    }

    private searchHandlerAlternative = async () => {
        let searchResult = {} as List<BeerIDAndModel>;
        if (this.state.isUntapped) {
            if (!(await this.isUntappdConnected(this.state))) {
                await this.setState({
                    hasSearched: false,
                    isUntapped: false,
                    searchStringAlternative: "",
                });
                return;
            }
            searchResult = (await BeerService.searchBeersUntappd({phrase: this.state.searchStringAlternative})).beers;
        } else {
            searchResult = (await BeerService.searchBeersDB({phrase: this.state.searchStringAlternative})).beers;
        }
        await this.setState({
            hasSearched: true,
            searchResult,
            searchStringAlternative: "",
        });
        if (this.props.reloadCollectionItem) { this.props.reloadCollectionItem(); }
    }

    private searchInputHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            searchString: event.target.value,
        });
    }

    private searchInputHandlerAlternative = async (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            searchStringAlternative: event.target.value,
        });
    }

    private filterOnChangeHandler = (event: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({
            hasSearched: false,
            isUntapped: event.target.value === "true",
        });
    }

    private closeStateHandler = () => {
        this.setState({
            hasSearched: false,
            isLoaded: true,
            searchResult: List<BeerIDAndModel>(),
            searchString: "",
            searchStringAlternative: "",
        });
        this.props.onClose();
    }

    private keyPressHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter") {
            this.searchButtonHandler();
        }
    }
}
