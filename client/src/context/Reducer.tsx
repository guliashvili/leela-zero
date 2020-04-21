import { BoardsState } from "./ish.go.logic";
import { Point } from "./ish.go";
export type Action = Readonly<
  { type: "back" } | { type: "playMove"; move: Point } | { type: "forward" }
>;

export const reducer = (state: BoardsState, action: Action) => {
  console.log("im reducing");
  // switch (action.type) {
  //   case "playMove":
  //     const newMoveState = state.move(action.move);
  //     if (!(newMoveState instanceof GameState)) {
  //       return state;
  //     }
  //     return newMoveState;
  //   case "back":
  //     // const newBackState = state.moveBackwards();
  //     // if (newBackState === null) {
  //     //   return state;
  //     // }
  //     // return newBackState;
  //
  //   case "forward":
  //   default:
  return state;
  // }
};
