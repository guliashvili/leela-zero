import React, { useContext, useEffect } from "react";
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
  useEffect(() => {
    dispatch({ type: "genAnalysis" });
  }, [gameState.core.getCurrentBoardState().index]);
  function onClick(point: Point, evt: Konva.KonvaEventObject<MouseEvent>) {
    dispatch({ type: "playMove", move: point });
  }
  function onMouseEnter(point: Point, evt: Konva.KonvaEventObject<MouseEvent>) {
    dispatch({
      type: "mouse",
      point:
        gameState.core.at(
          gameState.core.getCurrentBoardState().board,
          point
        ) === PointState.EMPTY
          ? point
          : null,
    });
  }

  return (
    <Stage
      width={props.boardSize}
      height={props.boardSize}
      onMouseLeave={() => dispatch({ type: "mouse", point: null })}
    >
      <Layer listening={false}>
        <Image image={background} />
      </Layer>
      <Layer>
        {[...Array(gameState.core.boardSize * gameState.core.boardSize)].map(
          (_, i) => {
            const point = new Point(
              i % gameState.core.boardSize,
              Math.floor(i / gameState.core.boardSize)
            );
            const pointS = gameState.core.at(
              gameState.core.getCurrentBoardState().board,
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
          }
        )}
      </Layer>
      <Layer listening={false}>
        {[...Array(gameState.core.boardSize * gameState.core.boardSize)].map(
          (_, i) => {
            const point = new Point(
              i % gameState.core.boardSize,
              Math.floor(i / gameState.core.boardSize)
            );

            return (
              <Hint
                key={`hint-${i}`}
                x={point.row * PIECE_SIZE + BOARD_PADDING}
                y={point.column * PIECE_SIZE + BOARD_PADDING}
                hotness={gameState.core.getCurrentBoardHotness(point)}
                radius={PIECE_SIZE / 2.0}
              />
            );
          }
        )}
      </Layer>
      <Layer listening={false}>
        {gameState.core.mousePoint == null ? null : (
          <Hover
            currentColor={
              gameState.core.getCurrentBoardState().currentPlayer.color
            }
            x={gameState.core.mousePoint.row * PIECE_SIZE + BOARD_PADDING}
            y={gameState.core.mousePoint.column * PIECE_SIZE + BOARD_PADDING}
          />
        )}
      </Layer>
    </Stage>
  );
};
