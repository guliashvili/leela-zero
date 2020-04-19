import { GameState } from "./ish.go.logic";
import { Point } from "./ish.go";
export type Action = Readonly<
  { type: "back" } | { type: "playMove"; move: Point } | { type: "forward" }
>;

export const reducer = (state: GameState, action: Action) => {
  console.log("im reducing");
  switch (action.type) {
    case "playMove":
      const newState = state.move(action.move);
      if (newState instanceof GameState) {
        console.log("was good");
        return newState;
      } else {
        console.log("was not good");
        return state;
      }
    case "back":
    case "forward":
    default:
      return state;
  }
};
