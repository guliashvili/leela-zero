import React, { useContext } from "react";
import Konva from "konva";
import { Stage, Layer, Star, Text, Image } from "react-konva";

import useImage from "use-image";
import { Point as PointComponent } from "../Point";
import { GoStateContext } from "../../context/GoState";
import imgBoard from "../../imgs/board.png";
import {
  Action,
  Color,
  MoveResult,
  Point,
  PointState,
} from "../../context/ish.go";

type Props = Readonly<{ boardSize: number }>;
const PIECE_SIZE = 27;
const BOARD_PADDING = 6;

export const Board = (props: Props): JSX.Element => {
  const [background] = useImage(imgBoard);
  const goState = useContext(GoStateContext);
  function onClick(point: Point, evt: Konva.KonvaEventObject<MouseEvent>) {
    if (goState === undefined) {
      return;
    }
    const { dispatch } = goState;
    dispatch({ type: "playMove", move: point });
    console.log(point, evt);
  }
  if (goState === undefined) {
    return <div />;
  }

  const { gameState } = goState;

  return (
    <Stage width={props.boardSize} height={props.boardSize}>
      <Layer>
        <Image image={background} />
      </Layer>
      <Layer>
        {[...Array(gameState.boardSize * gameState.boardSize)].map((_, i) => {
          const point = new Point(
            i % gameState.boardSize,
            Math.floor(i / gameState.boardSize)
          );
          return (
            <PointComponent
              key={i}
              point={point}
              x={point.row * PIECE_SIZE + BOARD_PADDING}
              y={point.column * PIECE_SIZE + BOARD_PADDING}
              pointState={gameState.getPointStateAt(point)}
              onClick={onClick}
            />
          );
        })}
      </Layer>
    </Stage>
  );
};
