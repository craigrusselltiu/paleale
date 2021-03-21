import {Intent} from "@blueprintjs/core";
import React from "react";
import {Redirect} from "react-router-dom";

import ProfileService from "../../service/profile";
import UntappdService from "../../service/untappd";
import AppToaster from "../common/apptoaster/AppToaster";
import CircleIndicator from "../common/progress/CircleIndicator";
import ScreenIndicator from "../common/progress/ScreenIndicator";

export interface UntappdCallbackState {
  isAuthorized: boolean;
}

export default class UntappdCallback extends React.PureComponent<{}, UntappdCallbackState> {
  public state: UntappdCallbackState = {
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
      <Redirect to="/profile"/>
    );
  }

  public async componentDidMount() {
    try {
      await ProfileService.authorizeUntappd({
        code: UntappdService.parseLogin(),
      });

      AppToaster.show({
        intent: Intent.SUCCESS,
        message: "Connected to Untappd",
      });

      this.setState({
        isAuthorized: true,
      });
    } catch {
      AppToaster.show({
        intent: Intent.DANGER,
        message: "Error while connecting to Untappd",
      });
    }
  }
}
