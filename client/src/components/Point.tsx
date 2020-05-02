import React from "react";
import useImage from "use-image";
import { Circle, Layer, Image } from "react-konva";
import { Color, Point as RealPoint, PointState } from "../context/ish.go";
import Konva from "konva";
import imgPieceBlack from "../imgs/piece-black.png";
import imgPieceWhite from "../imgs/piece-white.png";
import imgTransparent from "../imgs/transparent-stone.png";
import imgPieceBlackTransparent from "../imgs/piece-black-transparent.png";
import imgPieceWhiteTransparent from "../imgs/piece-white-transparent.png";

type Props = Readonly<{
  pointState:
    | {
        state: PointState.EMPTY;
        isHover: boolean;
        currentColor: Color;
      }
    | { state: PointState.BLACK | PointState.WHITE };
  x: number;
  y: number;
  point: RealPoint;
  onClick: (point: RealPoint, evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseEnter: (
    point: RealPoint,
    evt: Konva.KonvaEventObject<MouseEvent>
  ) => void;
}>;
export const Point = (props: Props) => {
  const [image] = useImage(
    (function () {
      switch (props.pointState.state) {
        case PointState.EMPTY:
          if (props.pointState.isHover) {
            switch (props.pointState.currentColor) {
              case Color.BLACK:
                return imgPieceBlackTransparent;
              case Color.WHITE:
                return imgPieceWhiteTransparent;
            }
          } else {
            return imgTransparent;
          }
        case PointState.BLACK:
          return imgPieceBlack;
        case PointState.WHITE:
          return imgPieceWhite;
      }
    })()
  );
  if (image == null) {
    return null;
  }

  return (
    <Image
      listening={true}
      x={props.x}
      y={props.y}
      image={image}
      onClick={(evt) => props.onClick(props.point, evt)}
      onMouseEnter={(evt) => props.onMouseEnter(props.point, evt)}
    />
  );
};
