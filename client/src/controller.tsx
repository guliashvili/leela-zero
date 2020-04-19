import { GameState } from "./context/ish.go.logic";
import { Point } from "./context/ish.go";
const axios = require("axios").default;

export namespace Controller {
  export async function getNextSuggestedMove(
    gameState: GameState
  ): Promise<Point> {
    const gameHistory = gameState.gameHistory.map((move) => {
      const action = move.actions.filter(
        (action) => action.stateNow === move.player.pointState
      )[0];
      return {
        x: action.point.row,
        y: action.point.column,
        isBlack: action.stateNow === 1,
      };
    });

    const response = await axios
      .post("/suggested_move", {
        moves: gameHistory,
      })
      .catch((error) => console.log("response error", error));
    console.log("givi response", response);

    return new Point(
      response["data"]["move"]["x"],
      response["data"]["move"]["y"]
    );
  }
}
