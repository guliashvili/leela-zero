import React, { useContext } from "react";
import Konva from "konva";
import { Image, Layer, Stage } from "react-konva";

import useImage from "use-image";
import { Point as PointComponent } from "./unit/Point";
import { Hint } from "./unit/Hint";
import { Hover } from "./unit/Hover";
import { GoStateContext } from "../../../context/GoState";
import imgBoard from "../../../imgs/board.png";
import { Point, PointState } from "../../../context/ish.go";
import { isEqual } from "lodash";

type Props = Readonly<{ boardSize: number }>;
const PIECE_SIZE = 27;
const BOARD_PADDING = 6;

export const Board = (props: Props): JSX.Element => {
  const [background] = useImage(imgBoard);
  const { dispatch, gameState } = useContext(GoStateContext);
  function onClick(point: Point, evt: Konva.KonvaEventObject<MouseEvent>) {
    dispatch({ type: "playMove", move: point });
  }
  function onMouseEnter(point: Point, evt: Konva.KonvaEventObject<MouseEvent>) {
    dispatch({ type: "mouseEnter", point: point });
  }

  return (
    <Stage width={props.boardSize} height={props.boardSize}>
      <Layer listening={false}>
        <Image image={background} />
      </Layer>
      <Layer>
        {[...Array(gameState.boardSize * gameState.boardSize)].map((_, i) => {
          const point = new Point(
            i % gameState.boardSize,
            Math.floor(i / gameState.boardSize)
          );
          const pointS = gameState.at(
            gameState.getCurrentBoardState().board,
            point
          );

          return (
            <PointComponent
              key={`point-${i}`}
              point={point}
              x={point.row * PIECE_SIZE + BOARD_PADDING}
              y={point.column * PIECE_SIZE + BOARD_PADDING}
              state={pointS}
              onClick={onClick}
              onMouseEnter={onMouseEnter}
            />
          );
        })}
      </Layer>
      <Layer listening={false}>
        {[...Array(gameState.boardSize * gameState.boardSize)].map((_, i) => {
          const point = new Point(
            i % gameState.boardSize,
            Math.floor(i / gameState.boardSize)
          );

          return (
            <Hint
              key={`hint-${i}`}
              x={point.row * PIECE_SIZE + BOARD_PADDING}
              y={point.column * PIECE_SIZE + BOARD_PADDING}
              hotness={gameState.getCurrentBoardHotness(point)}
              radius={PIECE_SIZE / 2.0}
            />
          );
        })}
      </Layer>
      <Layer listening={false}>
        {[...Array(gameState.boardSize * gameState.boardSize)].map((_, i) => {
          const point = new Point(
            i % gameState.boardSize,
            Math.floor(i / gameState.boardSize)
          );

          return (
            <Hover
              isHover={isEqual(gameState.mouseEnterPoint, point)}
              key={`hover-${i}`}
              currentColor={
                gameState.getCurrentBoardState().currentPlayer.color
              }
              x={point.row * PIECE_SIZE + BOARD_PADDING}
              y={point.column * PIECE_SIZE + BOARD_PADDING}
            />
          );
        })}
      </Layer>
    </Stage>
  );
};
