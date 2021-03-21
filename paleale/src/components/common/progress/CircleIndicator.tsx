import {Colors} from "@blueprintjs/core";
import React, {CSSProperties} from "react";

export interface CircleIndicatorProps {
  size: number;
}

export default class CircleIndicator extends React.PureComponent<CircleIndicatorProps, {}> {
  public static defaultProps = {
    size: 48,
  };

  public render() {
    const containerStyle: CSSProperties = {
      color: Colors.BLUE1,
      height: `${this.props.size}px`,
      width: `${this.props.size}px`,
    };

    const backgroundStyle: CSSProperties = {
      borderWidth: "3px",
    };

    const foregroundStyle: CSSProperties = {
      borderTopColor: "currentcolor",
      borderWidth: "3px",
    };

    return (
      <div className="relative" style={containerStyle}>
        <div
          className="w-full h-full absolute inset-0 border-all rounded-full opacity-25"
          style={backgroundStyle}
        />
        <div
          className="w-full h-full absolute inset-0 border-all rounded-full al-circle border-transparent"
          style={foregroundStyle}
        />
      </div>
    );
  }
}
