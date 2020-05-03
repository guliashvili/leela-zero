import React from "react";
import useImage from "use-image";
import { Image } from "react-konva";
import { Point as RealPoint, PointState } from "../../../../context/ish.go";
import Konva from "konva";
import imgPieceBlack from "../../../../imgs/piece-black.png";
import imgPieceWhite from "../../../../imgs/piece-white.png";
import imgTransparent from "../../../../imgs/transparent-stone.png";

type Props = Readonly<{
  state: PointState;
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
      switch (props.state) {
        case PointState.EMPTY:
          return imgTransparent;
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
