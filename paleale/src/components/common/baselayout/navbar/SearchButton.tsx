import { Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import React from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";

class SearchButton extends React.Component<{} & RouteComponentProps<{}>, {}> {
    public render() {
        return (
            <Button
                rightIcon={IconNames.SEARCH}
                intent={Intent.WARNING}
                onClick={this.searchHandler}
                large={false}
            />
        );
    }
    private searchHandler = () => {
        this.props.history.push({pathname: "/search"});
    }
}

export default withRouter(SearchButton);
