import React from "react";
import {Redirect} from "react-router-dom";

import Auth0Service from "../../service/auth0";
import {setAccessToken} from "../../service/authaxios";
import ProfileService from "../../service/profile";
import CircleIndicator from "../common/progress/CircleIndicator";
import ScreenIndicator from "../common/progress/ScreenIndicator";

export interface Auth0CallbackState {
  isAuthorized: boolean;
}

export default class Auth0Callback extends React.PureComponent<{}, Auth0CallbackState> {
  public state: Auth0CallbackState = {
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
      <Redirect to="/"/>
    );
  }

  public async componentDidMount() {
    try {
      await Auth0Service.parseLogin();
      setAccessToken(Auth0Service.getAccessToken());

      const profile = Auth0Service.getUserProfile();
      await ProfileService.addProfileIfNotExisted({
        email: profile.email ? profile.email : "",
        firstName: profile.given_name ? profile.given_name : "",
        lastName: profile.family_name ? profile.family_name : "",
        profilePicture: profile.picture,
      });

      this.setState({
        isAuthorized: true,
      });
    } catch {
      Auth0Service.triggerLogout();
    }
  }
}
