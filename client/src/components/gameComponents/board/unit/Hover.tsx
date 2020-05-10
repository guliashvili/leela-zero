import React from "react";
import { Image as KonvaImage } from "react-konva";
import { Color } from "../../../../context/ish.go";
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

  const imageObj = new Image();
  imageObj.src = (function () {
    switch (props.currentColor) {
      case Color.BLACK:
        return imgPieceBlackTransparent;
      case Color.WHITE:
        return imgPieceWhiteTransparent;
    }
  })();
  console.log("well", imageObj.src);

  return <KonvaImage x={props.x} y={props.y} image={imageObj} />;
};
