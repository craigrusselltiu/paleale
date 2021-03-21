import { H3, Intent } from "@blueprintjs/core";
import { List } from "immutable";
import React from "react";
import { Doughnut, HorizontalBar } from "react-chartjs-2";

import { DisplayBeerCollectionItem } from "../../model/beercollection";
import AppToaster from "../common/apptoaster/AppToaster";

export interface StyleProps {
  displayCollectionList: List<DisplayBeerCollectionItem>;
}

export interface StyleState {
  mobile: boolean;
  stylesData: number[];
}

export default class StyleSummary extends React.PureComponent<StyleProps, StyleState> {
  public state: StyleState = {
    mobile: window.innerWidth <= 760,
    stylesData: [0, 0, 0, 0, 0, 0, 0],
  };

  public componentDidMount = async () => {
    try {
      this.getStylesCount();
      window.addEventListener("resize", this.resize.bind(this));
      this.resize();
    } catch {
      AppToaster.show({
        intent: Intent.DANGER,
        message: "Error while loading collection list",
      });
    }
  }

  public resize() {
    this.setState({ mobile: window.innerWidth <= 760 });
  }

  public render() {
    const data = {
      datasets: [{
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#9900EF",
          "#FF6900",
          "#ABB8C3",
          "#7BDCB5",
        ],
        data: this.state.stylesData,
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#9900EF",
          "#FF6900",
          "#ABB8C3",
          "#7BDCB5",
        ],
      }],
      labels: [
        "Pale Ale",
        "IPA",
        "Stout",
        "Wheat Beer",
        "Lager",
        "Barleywine",
        "Other",
      ],
    };
    const barData = {
      datasets: [
        {
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#9900EF",
            "#FF6900",
            "#ABB8C3",
            "#7BDCB5",
          ],
          borderWidth: 1,
          data: this.state.stylesData,
          hoverBackgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#9900EF",
            "#FF6900",
            "#ABB8C3",
            "#7BDCB5",
          ],
          label: "Amount",
        },
      ],
      labels: [
        "Pale Ale",
        "IPA",
        "Stout",
        "Wheat Beer",
        "Lager",
        "Barleywine",
        "Other",
      ],
    };
    const noBeer = (
      <div className="p-5">
        <H3 className="uppercase text-grey-dark">You got no beer in your collection!</H3>
      </div>
    );
    const displayChart = this.state.mobile ? <HorizontalBar data={barData} /> : <Doughnut data={data} />;
    return (
      <div>
        {this.state.stylesData.every((i) => i === 0) ? noBeer : displayChart}
      </div>
    );
  }

  private getStylesCount = () => {
    if (!List.isList(this.props.displayCollectionList) || this.props.displayCollectionList.isEmpty()) {
      return;
    }
    let palealeTmp = 0;
    let ipaTmp = 0;
    let stoutTmp = 0;
    let wheatTmp = 0;
    let lagerTmp = 0;
    let pilsnerTmp = 0;
    let otherTmp = 0;
    this.props.displayCollectionList.forEach((item) => {
      if (item.beerData.beerStyle.match(/Pale Ale/gi)) {
        palealeTmp++;
      } else if (item.beerData.beerStyle.match(/IPA/gi)) {
        ipaTmp++;
      } else if (item.beerData.beerStyle.match(/Stout/gi)) {
        stoutTmp++;
      } else if (item.beerData.beerStyle.match(/Wheat/gi)) {
        wheatTmp++;
      } else if (item.beerData.beerStyle.match(/Lager/gi) || item.beerData.beerStyle.match(/Pilsner/gi)) {
        lagerTmp++;
      } else if (item.beerData.beerStyle.match(/barley/gi)) {
        pilsnerTmp++;
      } else {
        otherTmp++;
      }
    });
    this.setState({
      stylesData: [palealeTmp, ipaTmp, stoutTmp, wheatTmp, lagerTmp, pilsnerTmp, otherTmp],
    });
  }
}
