import { GameCore } from "./context/ish.go.logic";
import { Color } from "./context/ish.go";
import openSocket from "socket.io-client";
export const socket = openSocket("http://localhost:9000");

export namespace BackEndBird {
  export function getNextSuggestedMove(gameCore: GameCore): void {
    if (gameCore.getCurrentBoardState().analysis?.isPropagated) {
      return;
    }

    const gameHistory: { x: number; y: number; isBlack: boolean }[] = [];
    let currentBoard = gameCore.currentBoard;
    while (true) {
      const backBoard = gameCore.getBoard(currentBoard).back;
      if (backBoard === null) {
        break;
      }
      const backBoardState = gameCore.getBoard(backBoard);
      const actualChildUsed = backBoardState.children.find(
        (child) => child.state === currentBoard
      );
      if (actualChildUsed === undefined) {
        break;
      }
      gameHistory.unshift({
        x: actualChildUsed.move.row,
        y: actualChildUsed.move.column,
        isBlack: backBoardState.currentPlayer.color === Color.BLACK,
      });
      currentBoard = backBoard;
    }
    socket.emit("suggested_move", {
      moves: gameHistory,
      boardIdentifier: `${gameCore.currentBoard}`,
    });
  }
}
