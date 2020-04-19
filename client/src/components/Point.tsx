import React from "react";
import useImage from "use-image";
import { Image } from "react-konva";
import { Point as RealPoint, PointState } from "../context/ish.go";
import Konva from "konva";
import imgPieceBlack from "../imgs/piece-black.png";
import imgPieceWhite from "../imgs/piece-white.png";
import imgTransparent from "../imgs/transparent-stone.png";

type Props = Readonly<{
  pointState: PointState;
  x: number;
  y: number;
  point: RealPoint;
  onClick: (point: RealPoint, evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseEnter?: (
    point: RealPoint,
    evt: Konva.KonvaEventObject<MouseEvent>
  ) => void;
  onMouseLeave?: (
    point: RealPoint,
    evt: Konva.KonvaEventObject<MouseEvent>
  ) => void;
}>;
export const Point = (props: Props) => {
  const [image] = useImage(
    (function () {
      switch (props.pointState) {
        case PointState.BLACK:
          return imgPieceBlack;
        case PointState.EMPTY:
          return imgTransparent;
        case PointState.WHITE:
          return imgPieceWhite;
      }
    })()
  );

  return (
    <Image
      x={props.x}
      y={props.y}
      image={image}
      onClick={(evt) => props.onClick(props.point, evt)}
    />
  );
};
