import { H3, HTMLSelect, Intent } from "@blueprintjs/core";
import { List, Map } from "immutable";
import { DateTime } from "luxon";
import React from "react";
import { Line } from "react-chartjs-2";

import { DisplayBeerCollectionItem } from "../../model/beercollection";
import AppToaster from "../common/apptoaster/AppToaster";

export interface SummaryProps {
  displayCollectionList: List<DisplayBeerCollectionItem>;
}

export interface SummaryStates {
  amountMap: Map<DateTime["year"], Map<DateTime["month"], number>>;
  amountPerMonth: number[];
  chartType: string;
  spendingMap: Map<DateTime["year"], Map<DateTime["month"], number>>;
  spendingPerMonth: number[];
  yearOptions: List<number>;
  selectedYear: number;
}

const OPTIONS = [
  { label: "Purchases", value: "purchases" },
  { label: "Spendings", value: "spendings" },
];

export default class Summary extends React.PureComponent<SummaryProps, SummaryStates> {
  public state: SummaryStates = {
    amountMap: Map() as Map<DateTime["year"], Map<DateTime["month"], number>>,
    amountPerMonth: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    chartType: "purchases",
    selectedYear: 2019,
    spendingMap: Map() as Map<DateTime["year"], Map<DateTime["month"], number>>,
    spendingPerMonth: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    yearOptions: List<number>(),
  };

  public componentDidMount = async () => {
    try {
      this.calculateCollectionSizePerMonth();
      this.calculateSpendingPer();
    } catch {
      AppToaster.show({
        intent: Intent.DANGER,
        message: "Error while loading collection list",
      });
    }
  }

  public render() {
    const labelChoice = this.state.chartType === "purchases" ? "Total beer purchased" : "Total spending in $";
    const dataChoice = this.state.chartType === "purchases" ? this.state.amountPerMonth : this.state.spendingPerMonth;

    const format = {
      datasets: [
        {
          backgroundColor: "rgba(75,192,192,0.4)",
          borderCapStyle: "butt",
          borderColor: "rgba(75,192,192,1)",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          data: dataChoice,
          fill: false,
          label: labelChoice,
          lineTension: 0.1,
          pointBackgroundColor: "#fff",
          pointBorderColor: "rgba(75,192,192,1)",
          pointBorderWidth: 1,
          pointHitRadius: 10,
          pointHoverBackgroundColor: "rgba(75,192,192,1)",
          pointHoverBorderColor: "rgba(220,220,220,1)",
          pointHoverBorderWidth: 2,
          pointHoverRadius: 5,
          pointRadius: 1,
        },
      ],
      labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    };

    return (
      <div className="p-6">
        <HTMLSelect
          onChange={this.chartTypeOnChangeHandler}
          options={OPTIONS}
          minimal={true}
        />
        <HTMLSelect
          onChange={this.yearOnChangeHandler}
          options={this.state.yearOptions.toArray()}
          minimal={true}
        />
        <Line data={format} />
      </div>
    );
  }

  private calculateCollectionSizePerMonth = () => {
    if (!List.isList(this.props.displayCollectionList) || this.props.displayCollectionList.isEmpty()) {
      return (
        <div className="p-5">
          <H3 className="uppercase text-grey-dark">You got no beer in your collection!</H3>
        </div>
      );
    }
    const list = this.props.displayCollectionList.asImmutable();
    const tempMap = Map<DateTime["year"], Map<DateTime["month"], number>>().withMutations((map) => {
      list.forEach((entry) => {
        const purchaseDate = entry.purchaseDate;
        if (purchaseDate !== undefined) {
          // if the year is not in map
          if (!map.has(purchaseDate.year)) {
            const tempInner = Map<DateTime["month"], number>().set(purchaseDate.month, entry.bottlesNumber);
            map.set(purchaseDate.year, tempInner);
            // if year is in map but month is not
          } else if (!map.hasIn([purchaseDate.year, purchaseDate.month])) {
            map.setIn([purchaseDate.year, purchaseDate.month], entry.bottlesNumber);
            // else the month exist in that year already so a value in month must exist
          } else {
            map.updateIn([purchaseDate.year, purchaseDate.month], (x: number) => (x + entry.bottlesNumber));
          }
        }
      });
    });
    const keySet = tempMap.keySeq().toList().filter((item) => item > 1930);
    const tempAmountPerMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const temp = tempMap.get(2019);
    if (temp !== undefined) {
      temp.keySeq().toList().forEach((key) => {
        tempAmountPerMonth[key - 1] = temp!.get(key) || 0;
      });
    }
    this.setState({
      amountMap: tempMap,
      amountPerMonth: tempAmountPerMonth,
      yearOptions: keySet,
    });
  }

  private calculateSpendingPer = () => {
    if (!List.isList(this.props.displayCollectionList) || this.props.displayCollectionList.isEmpty()) {
      return (
        <div className="p-5">
          <H3 className="uppercase text-grey-dark">You got no spending!</H3>
        </div>
      );
    }
    const list = this.props.displayCollectionList.asImmutable();
    const tempMap = Map<DateTime["year"], Map<DateTime["month"], number>>().withMutations((map) => {
      list.forEach((entry) => {
        const purchaseDate = entry.purchaseDate;
        if (purchaseDate !== undefined) {
          const inc = (x: number) => (x + entry.purchasePrice);
          // if the year is not in map
          if (!map.has(purchaseDate.year)) {
            const tempInner = Map<DateTime["month"], number>().set(purchaseDate.month, entry.purchasePrice);
            map.set(purchaseDate.year, tempInner);
            // if year is in map but month is not
          } else if (!map.hasIn([purchaseDate.year, purchaseDate.month])) {
            map.setIn([purchaseDate.year, purchaseDate.month], entry.purchasePrice);
            // else the month exist in that year already so a value in month must exist
          } else {
            map.update((innerMap) => {
              innerMap.updateIn([purchaseDate.year, purchaseDate.month], inc);
            });
          }
        }
      });
    });
    // currently hard coded to load 2019 first
    const temp = tempMap.get(2019);
    const perMonthList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (temp !== undefined) {
      temp.keySeq().toList().forEach((key) => {
        perMonthList[key - 1] = temp!.get(key) || 0;
      });
    }
    this.setState({
      spendingMap: tempMap,
      spendingPerMonth: perMonthList,
    });
  }

  // these 2 methods are a little buggy
  private chartTypeOnChangeHandler = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({
      chartType: event.target.value,
    });
  }
  private yearOnChangeHandler = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const temp = this.state.chartType === "purchases" ? this.state.amountMap.get(Number(event.target.value))
      : this.state.spendingMap.get(Number(event.target.value));
    const perMonthList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    temp!.keySeq().toList().forEach((key) => {
      perMonthList[key - 1] = temp!.get(key) || 0;
    });
    if (this.state.chartType === "purchases") {
      this.setState({
        amountPerMonth: perMonthList,
        selectedYear: Number(event.target.value),
      });
    }
    if (this.state.chartType === "spendings") {
      this.setState({
        selectedYear: Number(event.target.value),
        spendingPerMonth: perMonthList,
      });
    }
  }
}
