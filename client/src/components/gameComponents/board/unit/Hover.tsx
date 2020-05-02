import React from "react";
import useImage from "use-image";
import { Circle, Layer, Image } from "react-konva";
import {
  Color,
  Point as RealPoint,
  PointState,
} from "../../../../context/ish.go";
import Konva from "konva";
import imgPieceBlack from "../../../../imgs/piece-black.png";
import imgPieceWhite from "../../../../imgs/piece-white.png";
import imgTransparent from "../../../../imgs/transparent-stone.png";
import imgPieceBlackTransparent from "../../../../imgs/piece-black-transparent.png";
import imgPieceWhiteTransparent from "../../../../imgs/piece-white-transparent.png";

type Props = Readonly<{
  isHover: boolean;
  currentColor: Color;
  x: number;
  y: number;
}>;
export const Hover = (props: Props) => {
  if (!props.isHover) {
    return null;
  }
  const [image] = useImage(
    (function () {
      switch (props.currentColor) {
        case Color.BLACK:
          return imgPieceBlackTransparent;
        case Color.WHITE:
          return imgPieceWhiteTransparent;
      }
    })()
  );
  if (image == null) {
    return null;
  }

  return <Image listening={false} x={props.x} y={props.y} image={image} />;
};
