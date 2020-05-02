import React, { useContext } from "react";
import Konva from "konva";
import { Image, Layer, Stage } from "react-konva";

import useImage from "use-image";
import { Point as PointComponent } from "../../Point";
import { Hint } from "../../Hint";
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
    // dispatch({ type: "mouseEnter", point: point });
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
          const pointS = gameState.getPointStateAt(
            gameState.getCurrentBoardState().board,
            point
          );

          return (
            <PointComponent
              key={i}
              point={point}
              x={point.row * PIECE_SIZE + BOARD_PADDING}
              y={point.column * PIECE_SIZE + BOARD_PADDING}
              pointState={
                pointS === PointState.EMPTY
                  ? {
                      state: PointState.EMPTY,
                      currentColor: gameState.getCurrentBoardState()
                        .currentPlayer.color,
                      isHover: isEqual(gameState.mouseEnterPoint, point),
                    }
                  : { state: pointS }
              }
              onClick={onClick}
              onMouseEnter={onMouseEnter}
            />
          );
        })}
      </Layer>
      <Layer listening={false}>
        {[...Array(gameState.boardSize * gameState.boardSize)]
          .map((_, i) => {
            const point = new Point(
              i % gameState.boardSize,
              Math.floor(i / gameState.boardSize)
            );

            const hotness = gameState.getCurrentBoardHotness(point);
            if (hotness === null) {
              return null;
            }

            return (
              <Hint
                key={i * 1000}
                x={point.row * PIECE_SIZE + BOARD_PADDING}
                y={point.column * PIECE_SIZE + BOARD_PADDING}
                hotness={hotness}
                radius={PIECE_SIZE / 2.0}
              />
            );
          })
          .filter((component) => component != null)}
      </Layer>
    </Stage>
  );
};
