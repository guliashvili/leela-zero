import { MoveError, Player, Point, PointState } from "./ish.go";
import { cloneDeep, isEqual } from "lodash";
import { immerable } from "immer";

type BoardAnalysis = {
  winningChance: number;
  playouts: number;
  isPropagated: boolean;
};

type BoardState = {
  children: { move: Point; state: number }[];
  nextHint: number | null;
  back: number | null;
  currentPlayer: Player;
  board: PointState[][];
  analysis: null | BoardAnalysis;
  index: number;
};

export class GameCore {
  [immerable] = true;
  player1: Player;
  player2: Player;
  boardSize: number;
  currentBoard: number;
  _boards: BoardState[];
  mousePoint: Point | null;
  isPendingRecommendation: boolean;

  constructor(boardSize: number, player1: Player, player2: Player) {
    const board: PointState[][] = [];
    for (let i = 0; i < boardSize; i++) {
      board[i] = new Array(boardSize);
      for (let j = 0; j < boardSize; j++) {
        board[i][j] = PointState.EMPTY;
      }
    }

    this.isPendingRecommendation = false;
    this.mousePoint = null;
    this.player1 = player1;
    (this.player2 = player2),
      (this.boardSize = boardSize),
      (this.currentBoard = 0),
      (this._boards = [
        {
          children: [],
          nextHint: null,
          back: null,
          currentPlayer: player1,
          board,
          index: 0,
          analysis: null,
        },
      ]);
  }
  getBoard(boardID: number): BoardState {
    return this._boards[boardID];
  }
  setMouse(point: Point | null): void {
    if (
      point !== null &&
      this.at(this.getCurrentBoardState().board, point) !== PointState.EMPTY
    ) {
      return;
    }
    this.mousePoint = point;
  }
  getCurrentBoardHotness(point: Point): number | null {
    const currentBoardState = this.getCurrentBoardState();
    const child = currentBoardState.children.find((child) =>
      isEqual(child.move, point)
    );
    if (child === undefined) {
      return null;
    }
    const analysis = this.getBoard(child.state).analysis;
    if (analysis === null) {
      return null;
    }
    return 1 - analysis.winningChance;
  }
  updateAnalysis(
    playouts: number,
    winningChance: number,
    moves: Point[],
    boardIdentifier: number,
    isPropagated: boolean
  ): void {
    const move = moves.shift();
    if (move === undefined) {
      return;
    }

    const board = this.getBoard(boardIdentifier);
    if (
      board.analysis == null ||
      (board.analysis.isPropagated && !isPropagated) ||
      board.analysis.winningChance < winningChance
    ) {
      board.analysis = { playouts, winningChance, isPropagated };
    }
    const nextIndentifier = this.move(board, move);
    if (typeof nextIndentifier === "number") {
      this.updateAnalysis(
        playouts,
        1 - winningChance,
        moves,
        nextIndentifier,
        true
      );
    }
  }
  getCurrentBoardState(): BoardState {
    return this.getBoard(this.currentBoard);
  }
  at(board: PointState[][], point: Point): PointState {
    return board[point.column][point.row];
  }
  _setAt(board: PointState[][], point: Point, pointState: PointState): void {
    board[point.column][point.row] = pointState;
  }

  _isUniqueBoard(
    boardState: BoardState,
    backBoardState: BoardState | null
  ): boolean {
    if (backBoardState === null) {
      return true;
    }
    return !isEqual(boardState.board, backBoardState.board);
  }

  _getNeighborsAt(boardSize: number, point: Point): Point[] {
    const steps = [
      [-1, 0],
      [0, -1],
      [1, 0],
      [0, 1],
    ];
    return steps
      .map((step) => new Point(point.row + step[0], point.column + step[1]))
      .filter(
        (point) =>
          Math.min(point.row, point.column) >= 0 &&
          Math.max(point.row, point.column) < boardSize
      );
  }

  _getChainPoints(
    board: PointState[][],
    point: Point,
    chainPoints: Point[]
  ): Point[] {
    const pState = this.at(board, point);
    chainPoints.push(point);

    for (const nPoint of this._getNeighborsAt(board.length, point)) {
      const nState = this.at(board, nPoint);
      if (pState === nState && !nPoint.isInArray(chainPoints)) {
        this._getChainPoints(board, nPoint, chainPoints);
      }
    }
    return chainPoints;
  }

  _getLibertyPoints(board: PointState[][], point: Point): number {
    const chain = this._getChainPoints(board, point, []);
    const libPoints = new Set();
    for (const chainPoint of chain) {
      for (const nPoint of this._getNeighborsAt(board.length, chainPoint)) {
        const state = this.at(board, nPoint);
        if (state === PointState.EMPTY) {
          libPoints.add(nPoint);
        }
      }
    }
    return libPoints.size;
  }

  _getCapturedPoints(board: PointState[][], point: Point): Point[] {
    let capPoints: Point[] = [];
    const pState = this.at(board, point);

    for (const nPoint of this._getNeighborsAt(board.length, point)) {
      const nState = this.at(board, nPoint);
      if (nState !== pState && nState !== PointState.EMPTY) {
        if (
          !nPoint.isInArray(capPoints) &&
          this._getLibertyPoints(board, nPoint) === 0
        ) {
          const chain = this._getChainPoints(board, nPoint, []);
          capPoints = capPoints.concat(chain);
        }
      }
    }
    return capPoints;
  }

  _isValidMove(
    boardState: BoardState,
    backBoardState: BoardState | null,
    point: Point
  ): MoveError | void {
    // Check for repeating board state
    if (!this._isUniqueBoard(boardState, backBoardState)) {
      return MoveError.REPEAT;
    }
    if (this._getLibertyPoints(boardState.board, point) === 0) {
      return MoveError.SUICIDE;
    }
  }

  getNewBoardID(_board: PointState[][]): number {
    return this._boards.length;
  }

  move(boardState: BoardState, point: Point): MoveError | number {
    const child = boardState.children.find((child) =>
      isEqual(child.move, point)
    );
    if (child !== undefined) {
      return child.state;
    }

    if (this.at(boardState.board, point) !== PointState.EMPTY) {
      return MoveError.SUICIDE;
    }

    const player =
      boardState.currentPlayer === this.player1 ? this.player2 : this.player1;
    const newBoard = cloneDeep(boardState.board);

    this._setAt(newBoard, point, boardState.currentPlayer.pointState);
    const capturedPoints = this._getCapturedPoints(newBoard, point);
    capturedPoints.forEach((capture) =>
      this._setAt(newBoard, capture, PointState.EMPTY)
    );

    const newCurrentBoardState: BoardState = {
      children: [],
      nextHint: null,
      back: boardState.index,
      currentPlayer: player,
      board: newBoard,
      index: this.getNewBoardID(newBoard),
      analysis: null,
    };

    const error = this._isValidMove(
      newCurrentBoardState,
      boardState.back === null ? null : this.getBoard(boardState.back),
      point
    );
    if (error !== undefined) {
      return error;
    }

    boardState.children.push({
      move: point,
      state: this._boards.push(newCurrentBoardState) - 1,
    });

    if (boardState.children.length === 1) {
      boardState.nextHint = boardState.nextHint ?? this.currentBoard;
    }
    return newCurrentBoardState.index;
  }
  moveCurrent(point: Point): void {
    const result = this.move(this.getCurrentBoardState(), point);
    if (typeof result === "number") {
      this.currentBoard = result;
    }
    if (isEqual(this.mousePoint, point)) {
      this.mousePoint = null;
    }
  }

  moveBackwards(): void {
    const currentBoard = this.getCurrentBoardState();
    const backBoardState = currentBoard.back;
    if (backBoardState !== null) {
      this.getBoard(backBoardState).nextHint = currentBoard.index;
      this.currentBoard = backBoardState;
    }
  }
  moveForward(): void {
    const currentBoard = this.getCurrentBoardState();
    this.currentBoard = currentBoard.nextHint ?? this.currentBoard;
  }
}
