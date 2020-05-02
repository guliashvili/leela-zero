import { GameCore } from "./context/ish.go.logic";
import { Color, Point } from "./context/ish.go";

const axios = require("axios").default;

export namespace BackEndBird {
  export async function getNextSuggestedMove(
    gameCore: GameCore
  ): Promise<Point> {
    const gameHistory: { x: number; y: number; isBlack: boolean }[] = [];
    let currentBoard = gameCore.currentBoard;
    while (true) {
      const backBoard = gameCore.boards[currentBoard].back;
      if (backBoard === null) {
        break;
      }
      const backBoardState = gameCore.boards[backBoard];
      const actualChildUsed = backBoardState.children.find(
        (child) => child.state === currentBoard
      );
      if (actualChildUsed === undefined) {
        console.log("actual child cant be not found");
        break;
      }
      gameHistory.unshift({
        x: actualChildUsed.move.row,
        y: actualChildUsed.move.column,
        isBlack: backBoardState.currentPlayer.color === Color.WHITE,
      });
      currentBoard = backBoard;
    }
    console.log("sending", gameHistory);

    const response = await axios
      .post("/suggested_move", {
        moves: gameHistory,
        boardIdentifier: `${gameCore.currentBoard}`,
      })
      .catch((error) => console.log("response error", error));
    console.log("givi response", response);

    return new Point(
      response["data"]["move"]["x"],
      response["data"]["move"]["y"]
    );
  }
}
