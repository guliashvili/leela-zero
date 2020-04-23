import { BoardsState, GameCore } from "./ish.go.logic";
import { Point } from "./ish.go";
import produce, { setAutoFreeze, Draft } from "immer";
export type Action = Readonly<
  { type: "back" } | { type: "playMove"; move: Point } | { type: "forward" }
>;
setAutoFreeze(false);
export const reducer = produce((draft: Draft<BoardsState>, action: Action) => {
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
