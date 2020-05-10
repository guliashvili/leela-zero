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
type Meta = {
  loadingAnalysis: { [Key: number]: boolean };
};
type State = {
  meta: Meta;
  core: GameCore;
};

const reducer = produce((draft: Draft<State>, action: Action) => {
  switch (action.type) {
    case "playMove":
      draft.core.moveCurrent(action.move);
      break;
    case "back":
      draft.core.moveBackwards();
      break;
    case "genAnalysis":
      BackEndBird.getNextSuggestedMove(draft.core);
      break;
    case "forward":
      draft.core.moveForward();
      break;
    case "mouse":
      draft.core.setMouse(action.point);
      console.log("mouse ", draft.core.mousePoint);
      break;
    case "pendingRecommendation":
      draft.core.isPendingRecommendation = true;
      break;
    case "addSuggestion":
      draft.core.updateAnalysis(
        action.playouts,
        action.winningChance,
        action.moves.map((move) => new Point(move.x, move.y)),
        action.boardIdentifier,
        false
      );
      break;
  }
});

const initialState = {
  core: new GameCore(
    19,
    new Player(Color.BLACK, PointState.BLACK),
    new Player(Color.WHITE, PointState.WHITE)
  ),
  meta: { loadingAnalysis: {} },
};
type GoStateContextProps = {
  gameState: State;
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
