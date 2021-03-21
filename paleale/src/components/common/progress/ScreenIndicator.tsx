import React from "react";

export default class ScreenIndicator extends React.PureComponent<{}, {}> {
  public render() {
    return (
      <div className="w-screen h-screen flex flex-col justify-center items-center">
        {this.props.children}
      </div>
    );
  }
}
