import { Alignment, Button, Classes, Colors, Icon, IconName, Menu, Navbar, Popover } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { DateTime } from "luxon";
import React from "react";
import { Link } from "react-router-dom";

import Auth0Service from "../../../service/auth0";

import Notifications from "./navbar/notification/Notification";

export default class BaseLayout extends React.PureComponent<{}, {}> {
  private static renderNavLink(to: string, icon: IconName, text?: string) {
    return (
      <Link to={to} className={classNames(Classes.BUTTON, Classes.MINIMAL)}>
        <Icon icon={icon} color="#BEE3F8" />
        {text && <span className={Classes.BUTTON_TEXT}>{text}</span>}
      </Link>
    );
  }

  public render() {
    const navbarStyle: React.CSSProperties = {
      backgroundColor: Colors.BLUE1,
    };

    const menu = (
      <Menu>
        <Menu.Item icon={IconNames.LOG_OUT} onClick={Auth0Service.triggerLogout} text="Logout" />
      </Menu>
    );

    const notifIcon = (
      <Icon
        icon={this.checkIfUnreadNotif() ? IconNames.NOTIFICATIONS : IconNames.NOTIFICATIONS_UPDATED}
        color={this.checkIfUnreadNotif() ? "#BEE3F8" : "#00D084"}
      />
    );

    return (
      <React.Fragment>
        <Navbar className={Classes.DARK} style={navbarStyle}>
          <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading className="font-semibold">
              <span role="img" aria-label="Pale Ale">🍺 </span>
              Pale Ale
            </Navbar.Heading>
            <Navbar.Divider />
            {BaseLayout.renderNavLink("/", IconNames.DASHBOARD, "Dashboard")}
            {BaseLayout.renderNavLink("/list", IconNames.FULL_STACKED_CHART, "Collection List")}
          </Navbar.Group>
          <Navbar.Group align={Alignment.RIGHT}>
            <Popover content={<Notifications />}>
              <Button className={Classes.MINIMAL} icon={notifIcon} />
            </Popover>
            {BaseLayout.renderNavLink("/profile", IconNames.USER)}
            <Popover content={menu}>
              <Button className={Classes.MINIMAL} icon={<Icon icon={IconNames.COG} color="#BEE3F8" />} />
            </Popover>
          </Navbar.Group>
        </Navbar>
        {this.props.children}
      </React.Fragment>
    );
  }
  private checkIfUnreadNotif() {
    const top = JSON.parse(localStorage.getItem("notifications") || "{}");
    if (Object.keys(top).length !== 0) {
      if (top[0].date.slice(0, 10) === DateTime.local().toString().slice(0, 10)) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
}
