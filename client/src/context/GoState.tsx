import React, { createContext, useReducer } from "react";
import { GameCore, BoardsState } from "./ish.go.logic";
import { Color, Player, PointState } from "./ish.go";
import { Point } from "./ish.go";
import produce, { Draft } from "immer";
export type Action = Readonly<
  { type: "back" } | { type: "playMove"; move: Point } | { type: "forward" }
>;
const reducer = produce((draft: Draft<BoardsState>, action: Action) => {
  switch (action.type) {
    case "playMove":
      GameCore.move(draft, action.move);
      break;
    case "back":
      GameCore.moveBackwards(draft);
      break;
    case "forward":
      GameCore.moveForward(draft);
      break;
  }
});

const initialState = GameCore.getInitialBoardsState(
  19,
  new Player(Color.BLACK, PointState.BLACK),
  new Player(Color.WHITE, PointState.WHITE)
);
type GoStateContextProps = {
  gameState: BoardsState;
  dispatch(action: Action): void;
};
export const GoStateContext = createContext<GoStateContextProps>({
  gameState: initialState,
  dispatch(action: Action): void {
    return;
  },
});

type GoStateProviderProps = { children?: React.ReactNode };

const GoStateProvider: React.FC<{}> = ({ children }: GoStateProviderProps) => {
  const [gameState, dispatch] = useReducer(reducer, initialState);

  return (
    // @ts-ignore
    <GoStateContext.Provider value={{ gameState, dispatch }}>
      {children}
    </GoStateContext.Provider>
  );
};

export default GoStateProvider;
