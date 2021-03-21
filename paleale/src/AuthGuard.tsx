import React from "react";
import {Switch} from "react-router-dom";
import {Route} from "react-router-dom";

import UntappdCallback from "./components/callback/UntappdCallback";
import CollectionList from "./components/collectionlist/CollectionList";
import CircleIndicator from "./components/common/progress/CircleIndicator";
import ScreenIndicator from "./components/common/progress/ScreenIndicator";
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/profile/Profile";
import Auth0Service from "./service/auth0";
import {setAccessToken} from "./service/authaxios";

export interface AuthGuardState {
  isAuthorized: boolean;
}

export default class AuthGuard extends React.PureComponent<{}, AuthGuardState> {
  private static renderAppRoutes() {
    return (
      <Switch>
        <Route exact={true} path="/" component={Dashboard}/>
        <Route path="/profile" component={Profile}/>
        <Route path="/list" component={CollectionList}/>
        <Route path="/auth/untappd" component={UntappdCallback}/>
      </Switch>
    );
  }

  public state: AuthGuardState = {
    isAuthorized: false,
  };

  public render() {
    if (!this.state.isAuthorized) {
      return (
        <ScreenIndicator>
          <CircleIndicator/>
        </ScreenIndicator>
      );
    }

    return (
      <React.Fragment>
        {AuthGuard.renderAppRoutes()}
      </React.Fragment>
    );
  }

  public async componentDidMount() {
    if (Auth0Service.isLoggedIn()) {
      try {
        await Auth0Service.renewToken();
        setAccessToken(Auth0Service.getAccessToken());
        this.setState({
          isAuthorized: true,
        });
      } catch {
        Auth0Service.triggerLogout();
      }
    } else {
      Auth0Service.triggerLogin();
    }
  }
}
