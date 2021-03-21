import { Button, Intent } from "@blueprintjs/core";
import React from "react";

import Auth0Service from "../../service/auth0";
import ProfileService from "../../service/profile";
import UntappdService from "../../service/untappd";
import AppToaster from "../common/apptoaster/AppToaster";
import BaseLayout from "../common/baselayout/BaseLayout";
import CircleIndicator from "../common/progress/CircleIndicator";

export interface ProfileStates {
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
  isConnectedWithUntappd: boolean;
  isProfileLoaded: boolean;
}

export default class Profile extends React.PureComponent<{}, ProfileStates> {
  public state: ProfileStates = {
    email: "",
    firstName: "",
    isConnectedWithUntappd: false,
    isProfileLoaded: false,
    lastName: "",
    profilePicture: "",
  };

  public render() {
    const loaderStyle: React.CSSProperties = {
      height: "calc(100vh - 50px)",
    };

    const loader = (
      <div style={loaderStyle}>
        <CircleIndicator />
      </div>
    );

    return (
      <BaseLayout>
        {this.state.isProfileLoaded ? this.renderProfile() : loader}
      </BaseLayout>
    );
  }

  public async componentDidMount() {
    try {
      const profile = await ProfileService.getProfile();
      this.setState({
        email: profile.email,
        firstName: profile.firstName,
        isConnectedWithUntappd: profile.isConnectedWithUntappd,
        isProfileLoaded: true,
        lastName: profile.lastName,
        profilePicture: profile.profilePicture,
      });
    } catch {
      AppToaster.show({
        intent: Intent.DANGER,
        message: "Error while loading profile",
      });
    }
  }

  private onDisconnectUntappd = async () => {
    try {
      await ProfileService.disconnectUntappd();
      AppToaster.show({
        intent: Intent.PRIMARY,
        message: "Disconnected Untappd",
      });
      this.setState({
        isConnectedWithUntappd: false,
      });
    } catch {
      AppToaster.show({
        intent: Intent.DANGER,
        message: "Error while disconnecting Untappd",
      });
    }
  }

  private renderProfile() {
    const connectUntappdBtn = (
      <Button
        intent={Intent.PRIMARY}
        onClick={UntappdService.triggerAuthenticate}
        text="Connect Untappd"
      />
    );

    const disconnectUntappdBtn = (
      <Button
        intent={Intent.WARNING}
        onClick={this.onDisconnectUntappd}
        text="Disconnect Untappd"
      />
    );

    return (
      <div className="content-center">
        <div className="rounded overflow-hidden shadow-lg p-10 text-center">
          <img className="w-full h-48 object-contain object-center" src={this.state.profilePicture} alt="Avatar" />
          <div className="px-6 py-4">
            <div className="font-bold text-xl mb-2">{this.state.firstName} {this.state.lastName}</div>
            <p className="text-gray-700 text-base">
              Email: {this.state.email}
            </p>
          </div>
          <div className="px-6 py-4">
            {/* <pre className="whitespace-pre">{Auth0Service.getAccessToken()}</pre> */}
            {this.state.isConnectedWithUntappd ? disconnectUntappdBtn : connectUntappdBtn}
          </div>
        </div>
      </div>
    );
  }
}
