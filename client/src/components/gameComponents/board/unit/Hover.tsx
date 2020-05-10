import React from "react";
import { Image as KonvaImage } from "react-konva";
import { Color } from "../../../../context/ish.go";
import imgPieceBlackTransparent from "../../../../imgs/piece-black-transparent.png";
import imgPieceWhiteTransparent from "../../../../imgs/piece-white-transparent.png";

type Props = Readonly<{
  currentColor: Color;
  x: number;
  y: number;
}>;
export const Hover = (props: Props) => {
  const imageObj = new Image();
  imageObj.src = (function () {
    switch (props.currentColor) {
      case Color.BLACK:
        return imgPieceBlackTransparent;
      case Color.WHITE:
        return imgPieceWhiteTransparent;
    }
  })();

  return <KonvaImage x={props.x} y={props.y} image={imageObj} />;
};
