import React, { createContext, useReducer } from "react";
import { reducer, Action } from "./reducer";
import { GameCore, BoardsState } from "./ish.go.logic";
import { Color, Player, PointState } from "./ish.go";

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
