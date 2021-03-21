import { Callout, Intent } from "@blueprintjs/core";
import { List, Stack } from "immutable";
import { DateTime } from "luxon";
import React from "react";
import { Link } from "react-router-dom";

import { BeerID } from "../../../../../id";
import { BeerCollectionItem, DisplayBeerCollectionItem } from "../../../../../model/beercollection";
import BeerService from "../../../../../service/beer";
import BeerCollectionServices from "../../../../../service/beercollection";
import AppToaster from "../../../apptoaster/AppToaster";
import CircleIndicator from "../../../progress/CircleIndicator";

import NotificationItem from "./NotificationItem";

export interface NotificationsState {
  displayCollectionList: List<DisplayBeerCollectionItem>;
  displayNotifStack: Stack<NotificationItem>;
  expiredNum: number;
  isLoaded: boolean;
  noNotifs: boolean;
  todayNum: number;
  twoWeeksNum: number;
}

export default class Notifications extends React.PureComponent<{}, NotificationsState> {
  public state: NotificationsState = {
    displayCollectionList: {} as List<DisplayBeerCollectionItem>,
    displayNotifStack: Stack<NotificationItem>(),
    expiredNum: 0,
    isLoaded: false,
    noNotifs: false,
    todayNum: 0,
    twoWeeksNum: 0,
  };

  public componentDidMount = async () => {
    try {
      this.getFullBeerList();
    } catch {
      AppToaster.show({
        intent: Intent.DANGER,
        message: "Error while loading collection list",
      });
    }
  }

  public render() {
    const loader = (
      <div className="flex justify-center items-center">
        <CircleIndicator />
      </div>
    );
    return (
      <div>{this.state.isLoaded ? this.renderStack() : loader}</div>
    );
  }

  private getIntent(type: string) {
    switch (type) {
      case "party":
        return "primary";
      case "today":
        return "warning";
      case "expired":
        return "danger";
    }
  }

  private generateText(type: string, beerNum: number) {
    switch (type) {
      case "party":
        return beerNum + " upcoming beer(s) in the next 2 weeks!";
      case "today":
        return beerNum + " beer(s) that will expire today!";
      case "expired":
        return beerNum + " beer(s) has expired!";
    }
  }

  private renderStack() {
    const tmp = JSON.parse(localStorage.getItem("notifications") || "{}");
    if (Object.keys(tmp).length !== 0) {
      const stack: Stack<NotificationItem> = tmp;
      // console.log("load from cookie");
      const notifs = stack.map((item, index) => {
        return (
          <Link key={index} to="/" style={{ textDecoration: "none", color: "white" }}>
            <Callout title={item.title} intent={this.getIntent(item.type)}>
              {this.generateText(item.type, item.beerNum)}
              <div>{item.date.toString().slice(0, 10)}</div>
            </Callout>
          </Link>
        );
      });
      return (
        <div className="overflow-auto h-64">
          {notifs}
        </div>
      );
    } else {
      // console.log("load from state");
      if (this.state.displayNotifStack.isEmpty() && this.state.noNotifs) {
        return (
          <div>
            <Callout intent="primary">
              You have no notifications!
            </Callout>
          </div>
        );
      }
      const notifs = this.state.displayNotifStack.map((item, index) => {
        return (
          <Link key={index} to="/" style={{ textDecoration: "none", color: "white" }}>
            <Callout title={item.title} intent={item.getIntent()}>
              {item.generateText()}
              <div>{item.getDate()}</div>
            </Callout>
          </Link>
        );
      });
      return (
        <div>
          {notifs}
        </div>
      );
    }
  }
  private addNotification = (stack: Stack<NotificationItem>, cookie: boolean) => {
    const notifs = List().asMutable();
    if (this.state.twoWeeksNum !== 0) {
      const partyNotif = new NotificationItem("Party oppurtunity!", false,
        "party", DateTime.local(), this.state.twoWeeksNum);
      notifs.push(partyNotif);
    }
    if (this.state.todayNum !== 0) {
      const todayNotif = new NotificationItem("Expiring today!", false,
        "today", DateTime.local(), this.state.todayNum);
      notifs.push(todayNotif);
    }
    if (this.state.expiredNum !== 0) {
      const expiredNotif = new NotificationItem("Expired", false,
        "expired", DateTime.local(), this.state.expiredNum);
      notifs.push(expiredNotif);
    }
    if (notifs.size === 0) {
      this.setState({
        noNotifs: true,
      });
    }
    const tempStack = Stack().pushAll(cookie ? stack : []).pushAll(notifs);
    this.setState({
      displayNotifStack: tempStack,
    });
    localStorage.setItem("notifications", JSON.stringify(tempStack));
  }

  private computeNotifications = () => {
    const list = this.state.displayCollectionList
      .toList()
      .asImmutable()
      .filter((item) => item!.bestBeforeDate!.year !== 1);
    const sortedList = list.sortBy((item) => item.bestBeforeDate);
    const notifParty = sortedList.filter(
      (x) =>
        (x!.bestBeforeDate!.diffNow(["week"]).weeks <= 2 &&
          x!.bestBeforeDate!.diffNow(["week"]).weeks > 0),
    );
    const notifWarn = sortedList.filter(
      (x) =>
        (x!.bestBeforeDate!.diffNow(["days"]).days > -1 &&
          x!.bestBeforeDate!.diffNow(["days"]).days <= 0),
    );
    const notifDanger = sortedList.filter(
      (x) => x!.bestBeforeDate!.diffNow(["days"]).days < -1,
    );
    this.setState({
      expiredNum: notifDanger.size,
      todayNum: notifWarn.size,
      twoWeeksNum: notifParty.size,
    });
  }

  private getFullBeerList = async () => {
    const rawCollectionList = await BeerCollectionServices.bulkGetAllUserBeerCollections();
    const beerCollectionItemList: BeerCollectionItem[] = [];
    rawCollectionList.collections.entrySeq().forEach((entry) => {
      entry[1].items.forEach((items) => {
        beerCollectionItemList.push(items);
      });
    });
    const idList = List<BeerID>().withMutations((list) => {
      beerCollectionItemList.forEach((entry) => {
        list.push(entry.beerID);
      });
    });
    const rawBeersData = await BeerService.bulkGetBeerByIDs({
      beerIDs: idList,
    });

    const displayCollectionItems = List<DisplayBeerCollectionItem>().withMutations((map) => {
      beerCollectionItemList.forEach((item) => {
        const beerData = rawBeersData.beers.get(item.beerID);
        if (!beerData) {
          return;
        }
        map.push({
          beerData,
          beerID: item.beerID,
          bestBeforeDate: item.bestBeforeDate,
          bottlesNumber: item.bottlesNumber,
          breweryData: undefined,
          purchaseDate: item.purchaseDate,
          purchaseDistributor: item.storageLocation,
          purchasePrice: item.purchasePrice,
          storageLocation: item.storageLocation,
        });
      });
    });
    this.setState({
      displayCollectionList: displayCollectionItems,
      isLoaded: true,
    });
    this.computeNotifications();
    const top = JSON.parse(localStorage.getItem("notifications") || "{}");
    if (Object.keys(top).length !== 0) {
      // console.log("cookie exist and not empty");
      if (top[0].date.slice(0, 10) !== DateTime.local().toString().slice(0, 10)) {
        this.addNotification(top, true);
        // console.log("not notified today yet");
      } else {
        // console.log("notified today already");
        return;
      }
    } else {
      this.addNotification(top, false);
    }
  }
}
