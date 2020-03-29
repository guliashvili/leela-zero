import { Color, Player, Point, PointState } from "./ish.go";
import { GameState } from "./ish.go.logic";
// import * as io from "socket.io-client";
// Ish.Go namespace declaration

// begin Ish.Go.View namespace
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace View {
  // const socket = io("http://localhost:3000");
  export const BOARD_SIZE = 19;
  const BOARD_PADDING = 6;
  const PIECE_SIZE = 27;
  const PIXEL_SIZE = 522;
  const IMG_BLACK = "imgs/piece-black.png";
  const IMG_WHITE = "imgs/piece-white.png";

  let canvas;
  export let gGameState;
  let context;

  // Given a mouse event, returns Coords relative to the canvas
  function getCanvasCoords(e): Point {
    let x, y;

    // Get xy coords on page
    if (e.pageX != undefined && e.pageY != undefined) {
      x = e.pageX;
      y = e.pageY;
    } else {
      x =
        e.clientX +
        document.body.scrollLeft +
        document.documentElement.scrollLeft;
      y =
        e.clientY +
        document.body.scrollTop +
        document.documentElement.scrollTop;
    }

    // Narrow xy coords to canvas
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    return new Point(x, y);
  }

  function getPoint(e: any): Point | null {
    let { row, column } = getCanvasCoords(e);

    // Remove padding from coords
    row -= BOARD_PADDING;
    column -= BOARD_PADDING;

    // Check if xy coords are in the padding
    if (
      Math.min(row, column) <= 0 ||
      Math.max(row, column) >= PIXEL_SIZE - 2 * BOARD_PADDING
    ) {
      return null;
    }

    // Get Point from xy coords on canvas
    const point = new Point(
      Math.floor(row / PIECE_SIZE),
      Math.floor(column / PIECE_SIZE)
    );
    return point;
  }

  function getCoordsFromPoint(point): Point {
    return new Point(
      point.row * PIECE_SIZE + BOARD_PADDING,
      point.column * PIECE_SIZE + BOARD_PADDING
    );
  }

  /**
   * Draws piece on canvas
   */
  function drawPiece(point, color) {
    const coords = getCoordsFromPoint(point);

    const piece = new Image();

    if (color == Color.BLACK) {
      piece.src = IMG_BLACK;
    } else {
      piece.src = IMG_WHITE;
    }

    piece.onload = function () {
      context.drawImage(piece, coords.row, coords.column);
    };
  }

  function removePieces(points) {
    let coords;
    $.each(points, function () {
      coords = getCoordsFromPoint(this);
      context.clearRect(coords.row, coords.column, PIECE_SIZE, PIECE_SIZE);
    });
  }

  function update(moveResult) {
    if (moveResult) {
      // Draw only board changes
      drawPiece(moveResult.newPoint, moveResult.player.color);
      removePieces(moveResult.capturedPoints);
    }
  }

  function placePiece(point) {
    const moveResult = gGameState.move(point);

    // Check for empty MoveResult (indicates invalid move)
    if (!moveResult) {
      let alertMsg = "Invalid Move";

      // Add specific message if present
      if (gGameState.moveError) {
        alertMsg += ":\n" + gGameState.moveError;
      }

      alert(alertMsg);
      return false;
    }

    // Redraw board changes as a result of the move
    update(moveResult);
    return true;
  }

  // Tracks clicks on the board (canvas)
  function clickListener(e) {
    const point = getPoint(e);
    if (point) {
      const isSuccess = placePiece(point);
      // if (isSuccess) {
      //   socket.emit("new move", {
      //     x: point.row,
      //     y: point.column,
      //     isBlack: true,
      //   });
      // }
    }
  }

  /**
   * Initializes a canvas and context for use in the View, but only if necessary
   */
  function initCanvas(): void {
    canvas = document.getElementById("go-canvas");

    canvas.width = canvas.height = PIXEL_SIZE;
    canvas.style.background = "transparent url(imgs/board.png) no-repeat 0 0";

    canvas.addEventListener("click", clickListener, false);

    context = canvas.getContext("2d");
  }

  // socket.on("new move", (data) => {
  //   console.log("got", data);
  //   placePiece(new Point(data["x"], data["y"]));
  // });

  function drawBoard() {
    context.clearRect(0, 0, PIXEL_SIZE, PIXEL_SIZE);
    for (let y = 0; y < gGameState.boardHeight; y++) {
      for (let x = 0; x < gGameState.boardWidth; x++) {
        const point = new Point(x, y);
        const pState = gGameState.getPointStateAt(point);
        if (pState == PointState.BLACK) {
          drawPiece(point, Color.BLACK);
        } else if (pState == PointState.WHITE) {
          drawPiece(point, Color.WHITE);
        }
      }
    }
  }

  function redraw(canvasElement) {
    // Create canvas and context if necessary
    if (!canvasElement) {
      initCanvas();
    }

    drawBoard();
  }

  /**
   * Starts a new game.
   */
  function startNewGame() {
    gGameState.newGame(BOARD_SIZE);

    redraw($("go-canvas"));
  }

  export function init() {
    // Initialize game state
    gGameState = new GameState(
      19,
      new Player(Color.BLACK, PointState.BLACK),
      new Player(Color.WHITE, PointState.WHITE)
    );

    redraw(null);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  View.init();
});
