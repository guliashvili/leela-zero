import { Ish } from "./ish.go.view.h5.js";

document.addEventListener("DOMContentLoaded", function () {
  Ish.Go.View.init();
});

const Constants = new (function () {
  this.Color = {
    BLACK: "black",
    WHITE: "white",
  };
  this.Direction = {
    NORTH: "north",
    EAST: "east",
    SOUTH: "south",
    WEST: "west",
    ALL: ["north", "east", "south", "west"],
  };
  this.PointState = {
    EMPTY: ".",
    BLACK: "X",
    WHITE: "O",
  };
  this.MoveError = {
    REPEAT: "The attempted move would result in a repeated board state.",
    OCCUPIED: "The selected intersection is occupied.",
    SUICIDE: "The attepted move would result in a suicide.",
  };
  this.GameStatus = {
    ACTIVE: "active",
    IDLE: "idle",
    ENDED: "ended",
  };
})();

/**
 * OBJ: Defines changed points after a move is made.
 */
function MoveResult(player, newPoint, capturedPoints) {
  this.player = player;
  this.newPoint = newPoint;
  this.capturedPoints = capturedPoints;
}

/**
 * OBJ: Defines common attributes for board points/intersections.
 */
function Point(row, column) {
  this.row = row;
  this.column = column;
  this.getNeighborAt = function (side) {
    switch (side) {
      case Constants.Direction.NORTH:
        return new Point(this.row - 1, this.column);
      case Constants.Direction.SOUTH:
        return new Point(this.row + 1, this.column);
      case Constants.Direction.EAST:
        return new Point(this.row, this.column + 1);
      case Constants.Direction.WEST:
        return new Point(this.row, this.column - 1);
    }
  };
  this.toString = function () {
    return "(" + this.row + ", " + this.column + ")";
  };
  this.equals = function (other) {
    return this.row == other.row && this.column == other.column;
  };
  this.isInArray = function (array) {
    for (const element of array) {
      if (this.equals(element)) {
        return true;
      }
    }
    return false;
  };
}

/**
 * OBJ: Defines common attrib
 * utes for a player.
 */
function Player(color, pointState, score) {
  this.color = color; // Constants.Color.(BLACK/WHITE)
  this.pointState = pointState; // Constants.PointState.(BLACK/WHITE)
  this.score = score || 0;

  this.equals = function (other) {
    return this.color == other.color;
  };
  this.toString = function () {
    return this.color;
  };
}

/**
 * OBJ: Defines common attributes for a game of Go.
 */
function GameState(boardWidth, boardHeight, player1, player2, status) {
  this.boardWidth = boardWidth;
  this.boardHeight = boardHeight;

  this.player1 = player1;
  this.player2 = player2;
  this.currentPlayer = player1;

  // Initialize board
  this.status = status || Constants.GameStatus.ACTIVE;
  this.board = new Array(this.boardHeight);
  for (let i = 0; i < this.boardHeight; i++) {
    this.board[i] = new Array(this.boardWidth);
    for (let j = 0; j < this.boardWidth; j++) {
      this.board[i][j] = Constants.PointState.EMPTY;
    }
  }
  this.previousBoard = $.extend(true, [], this.board);

  this.getPointStateAt = function (point) {
    return this.board[point.row][point.column];
  };
  this.setPointStateAt = function (point, pointState) {
    this.board[point.row][point.column] = pointState;
  };
  this.isUniqueBoard = function () {
    // Compare board and previousBoard arrays
    for (let y = 0; y < this.boardHeight; y++) {
      for (let x = 0; x < this.boardWidth; x++) {
        if (this.board[y][x] != this.previousBoard[y][x]) {
          return true;
        }
      }
    }
    return false;
  };
  this.getBoardCopy = function () {
    return $.extend(true, [], this.board);
  };
  this.setBoardCopy = function (board) {
    this.board = $.extend(true, [], board);
  };
}

export { Constants, Player, GameState, Point, MoveResult };
