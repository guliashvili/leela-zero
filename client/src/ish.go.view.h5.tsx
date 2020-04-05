import { Action, Color, MoveResult, Player, Point, PointState } from "./ish.go";
import { GameState } from "./ish.go.logic";
import { Controller } from "./controller";
import imgPieceBlack from "./imgs/piece-black.png";
import imgPieceWhite from "./imgs/piece-white.png";
import imgBoard from "./imgs/board.png";

// Ish.Go namespace declaration

// begin Ish.Go.View namespace
namespace View {
  export const BOARD_SIZE = 19;
  const BOARD_PADDING = 6;
  const PIECE_SIZE = 27;
  const PIXEL_SIZE = 522;

  let canvas;
  let gGameState;
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

  function getCoordsFromPoint(point: Point): Point {
    return new Point(
      point.row * PIECE_SIZE + BOARD_PADDING,
      point.column * PIECE_SIZE + BOARD_PADDING
    );
  }

  function drawPiece(point: Point, color: Color) {
    const coords = getCoordsFromPoint(point);

    const piece = new Image();

    if (color == Color.BLACK) {
      piece.src = imgPieceBlack;
    } else {
      piece.src = imgPieceWhite;
    }

    piece.onload = function () {
      context.drawImage(piece, coords.row, coords.column);
    };
  }

  function updateSquare(actions: Action[]) {
    actions.forEach((action) => {
      if (action.stateNow === PointState.EMPTY) {
        const coords = getCoordsFromPoint(action.point);
        context.clearRect(coords.row, coords.column, PIECE_SIZE, PIECE_SIZE);
      } else {
        drawPiece(
          action.point,
          action.stateNow === PointState.BLACK ? Color.BLACK : Color.WHITE
        );
      }
    });
  }

  function update(moveResult: MoveResult): void {
    if (moveResult) {
      // Draw only board changes
      updateSquare(moveResult.actions);
    }
  }

  export function placePiece(point: Point): boolean {
    const moveResult = gGameState.move(point);

    if (moveResult instanceof MoveResult) {
      update(moveResult);
      return true;
    }
    const alertMsg = `Invalid Move : ${moveResult}`;
    alert(alertMsg);
    return false;
  }

  // Tracks clicks on the board (canvas)
  function clickListener(e) {
    const point = getPoint(e);
    if (point) {
      const isSuccess = placePiece(point);
      if (isSuccess) {
        Controller.getNextSuggestedMove(gGameState).then((point) =>
          placePiece(point)
        );
      }
    }
  }

  /**
   * Initializes a canvas and context for use in the View, but only if necessary
   */
  function initCanvas(): void {
    canvas = document.getElementById("go-canvas");

    canvas.width = canvas.height = PIXEL_SIZE;
    canvas.style.background = `transparent url(${imgBoard}) no-repeat 0 0`;
    console.log(canvas.style.background);

    canvas.addEventListener("click", clickListener, false);

    context = canvas.getContext("2d");
  }

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

  export function init() {
    initCanvas();
    // Initialize game state
    gGameState = new GameState(
      19,
      new Player(Color.BLACK, PointState.BLACK),
      new Player(Color.WHITE, PointState.WHITE)
    );

    drawBoard();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  View.init();
});
