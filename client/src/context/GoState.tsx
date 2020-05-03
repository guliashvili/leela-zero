import React, { createContext, useReducer } from "react";
import { GameCore } from "./ish.go.logic";
import { Color, Player, PointState } from "./ish.go";
import { Point } from "./ish.go";
import produce, { Draft } from "immer";
import { BackEndBird } from "../BackEndBird";

export type Action = Readonly<
  | { type: "back" }
  | { type: "playMove"; move: Point }
  | { type: "mouse"; point: Point | null }
  | { type: "pendingRecommendation" }
  | { type: "forward" }
  | { type: "genAnalysis" }
  | {
      type: "addSuggestion";
      playouts: number;
      winningChance: number;
      moves: { x: number; y: number }[];
      boardIdentifier: number;
    }
>;
const reducer = produce((draft: Draft<GameCore>, action: Action) => {
  switch (action.type) {
    case "playMove":
      draft.moveCurrent(action.move);
      break;
    case "back":
      draft.moveBackwards();
      break;
    case "genAnalysis":
      BackEndBird.getNextSuggestedMove(draft);
      break;
    case "forward":
      draft.moveForward();
      break;
    case "mouse":
      draft.setMouse(action.point);
      break;
    case "pendingRecommendation":
      draft.isPendingRecommendation = true;
      break;
    case "addSuggestion":
      draft.updateAnalysis(
        action.playouts,
        action.winningChance,
        action.moves.map((move) => new Point(move.x, move.y)),
        action.boardIdentifier,
        false
      );
      break;
  }
});

const initialState = new GameCore(
  19,
  new Player(Color.BLACK, PointState.BLACK),
  new Player(Color.WHITE, PointState.WHITE)
);
type GoStateContextProps = {
  gameState: GameCore;
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
