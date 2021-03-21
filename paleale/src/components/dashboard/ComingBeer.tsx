import { H3 } from "@blueprintjs/core";
import { Cell, Column, Table } from "@blueprintjs/table";
import { List } from "immutable";
import React from "react";

import { DisplayBeerCollectionItem } from "../../model/beercollection";

export interface TableProps {
  displayCollectionList: List<DisplayBeerCollectionItem>;
}
export interface TableStates {
  isLoaded: boolean;
  mobile: boolean;
}

export default class ComingBeer extends React.PureComponent<TableProps, TableStates> {

  public state: TableStates = {
    isLoaded: false,
    mobile: window.innerWidth <= 760,
  };

  public componentDidMount() {
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();
  }

  public resize() {
    this.setState({ mobile: window.innerWidth <= 760 });
  }

  public render() {
    return (
      <div>
        {this.renderComingBeerTable()}
      </div>
    );
  }

  /*
    The use of ! operator is pretty hacky if there is a better way please tell me
   */
  private renderComingBeerTable = () => {
    const list = this.props.displayCollectionList.toList().asImmutable()
      .filter((item) => item!.bestBeforeDate!.year > 1930);
    if (!List.isList(this.props.displayCollectionList) || this.props.displayCollectionList.isEmpty()) {
      return (
        <div className="p-5">
          <H3 className="uppercase text-grey-dark">You got no beer coming up!</H3>
        </div>
      );
    }
    const sortedList = list.sortBy((item) => item.bestBeforeDate);

    const nameCellRenderer = (index: number) => {
      return <Cell>{sortedList.get(index)!.beerData.name}</Cell>;
    };

    const abvCellRenderer = (index: number) => {
      return <Cell>{sortedList.get(index)!.beerData.abv}</Cell>;
    };

    const styleCellRenderer = (index: number) => {
      return <Cell>{sortedList.get(index)!.beerData.beerStyle}</Cell>;
    };

    const priceCellRenderer = (index: number) => {
      return <Cell>{sortedList.get(index)!.purchasePrice}</Cell>;
    };

    const bottleNumCellRenderer = (index: number) => {
      return <Cell>{sortedList.get(index)!.bottlesNumber}</Cell>;
    };

    const bestBeforeDateCellRenderer = (index: number) => {
      let css = "";
      if (sortedList.get(index)!.bestBeforeDate!.diffNow(["days"]).days < -1) {
        css = "bg-red-400";
      }
      if (sortedList.get(index)!.bestBeforeDate!.diffNow(["days"]).days >= -1 &&
        sortedList.get(index)!.bestBeforeDate!.diffNow(["days"]).days <= 0) {
        css = "bg-orange-400";
      }
      return <Cell className={css}>{sortedList.get(index)!.bestBeforeDate!.toBSON().toDateString().slice(0, 15)}</Cell>;
    };

    const renderTable = (
      <Table numRows={sortedList.size > 20 ? 20 : sortedList.size}>
        <Column name="Best Before Date" cellRenderer={bestBeforeDateCellRenderer} />
        <Column name="Name" cellRenderer={nameCellRenderer} />
        <Column name="ABV" cellRenderer={abvCellRenderer} />
        <Column name="Style" cellRenderer={styleCellRenderer} />
        <Column name="Purchase Price ($)" cellRenderer={priceCellRenderer} />
        <Column name="Amount" cellRenderer={bottleNumCellRenderer} />
      </Table>
    );

    const mobileTable = (
      <Table numRows={sortedList.size > 20 ? 20 : sortedList.size}>
        <Column name="Best Before Date" cellRenderer={bestBeforeDateCellRenderer} />
        <Column name="Name" cellRenderer={nameCellRenderer} />
      </Table>
    );
    return this.state.mobile ? mobileTable : renderTable;
  }

}
