import React from "react";
import useImage from "use-image";
import { Image } from "react-konva";
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
