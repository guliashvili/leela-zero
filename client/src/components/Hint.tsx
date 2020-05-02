import React from "react";
import { Circle } from "react-konva";

type Props = Readonly<{
  hotness: number;
  x: number;
  y: number;
  radius: number;
}>;
export const Hint = (props: Props) => {
  const { radius, x, y, hotness } = props;
  return (
    <Circle
      listening={false}
      x={x + radius}
      y={y + radius}
      fill={"red"}
      radius={radius * Math.max(0.5, hotness)}
      opacity={0.8}
    />
  );
};
