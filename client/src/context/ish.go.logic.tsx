import { MoveError, Player, Point, PointState } from "./ish.go";
import { cloneDeep, isEqual } from "lodash";
type BoardState = {
  children: { move: Point; state: BoardState }[];
  nextHint: BoardState | null;
  back: BoardState | null;
  currentPlayer: Player;
  board: PointState[][];
};
export type BoardsState = {
  player1: Player;
  player2: Player;
  boardSize: number;
  currentBoard: BoardState;
};

export namespace GameCore {
  export function getInitialBoardsState(
    boardSize: number,
    player1: Player,
    player2: Player
  ): BoardsState {
    const board: PointState[][] = [];
    for (let i = 0; i < boardSize; i++) {
      board[i] = new Array(boardSize);
      for (let j = 0; j < boardSize; j++) {
        board[i][j] = PointState.EMPTY;
      }
    }

    return {
      player1,
      player2,
      boardSize,
      currentBoard: {
        children: [],
        nextHint: null,
        back: null,
        currentPlayer: player2,
        board,
      },
    };
  }
  export function getPointStateAt(
    board: PointState[][],
    point: Point
  ): PointState {
    return board[point.column][point.row];
  }
  function _setPointStateAt(
    board: PointState[][],
    point: Point,
    pointState: PointState
  ): void {
    board[point.column][point.row] = pointState;
  }
  function _isUniqueBoard(boardState: BoardState): boolean {
    const backState = boardState.back;
    if (backState === null) {
      return true;
    }
    const backBackState = backState.back;
    if (backBackState === null) {
      return true;
    }
    return isEqual(boardState.board, backBackState.board);
  }

  function _getNeighborsAt(boardSize: number, point: Point): Point[] {
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

  function _getChainPoints(
    board: PointState[][],
    point: Point,
    chainPoints: Point[]
  ): Point[] {
    const pState = getPointStateAt(board, point);
    chainPoints.push(point);

    for (const nPoint of _getNeighborsAt(board.length, point)) {
      const nState = getPointStateAt(board, nPoint);
      if (pState === nState && !nPoint.isInArray(chainPoints)) {
        _getChainPoints(board, nPoint, chainPoints);
      }
    }
    return chainPoints;
  }

  function _getLibertyPoints(board: PointState[][], point: Point): number {
    const chain = _getChainPoints(board, point, []);
    const libPoints = new Set();
    for (const chainPoint of chain) {
      for (const nPoint of _getNeighborsAt(board.length, chainPoint)) {
        const state = getPointStateAt(board, nPoint);
        if (state === PointState.EMPTY) {
          libPoints.add(nPoint);
        }
      }
    }
    return libPoints.size;
  }

  function _getCapturedPoints(board: PointState[][], point: Point): Point[] {
    let capPoints: Point[] = [];
    const pState = getPointStateAt(board, point);

    for (const nPoint of _getNeighborsAt(board.length, point)) {
      const nState = getPointStateAt(board, nPoint);
      if (nState !== pState && nState !== PointState.EMPTY) {
        if (
          !nPoint.isInArray(capPoints) &&
          _getLibertyPoints(board, nPoint) === 0
        ) {
          const chain = _getChainPoints(board, nPoint, []);
          capPoints = capPoints.concat(chain);
        }
      }
    }
    return capPoints;
  }

  function _isValidMove(
    boardState: BoardState,
    point: Point
  ): MoveError | void {
    // Check for repeating board state
    if (!_isUniqueBoard(boardState)) {
      return MoveError.REPEAT;
    }
    if (_getLibertyPoints(boardState.board, point) === 0) {
      return MoveError.SUICIDE;
    }
  }

  export function move(
    boardsState: BoardsState,
    point: Point
  ): MoveError | void {
    const child = boardsState.currentBoard.children.find((child) =>
      isEqual(child.move, point)
    );
    if (child !== undefined) {
      boardsState.currentBoard = child.state;
      return;
    }

    if (
      getPointStateAt(boardsState.currentBoard.board, point) !==
      PointState.EMPTY
    ) {
      return MoveError.SUICIDE;
    }

    const player = boardsState.currentBoard.currentPlayer;
    const newBoard = cloneDeep(boardsState.currentBoard.board);

    _setPointStateAt(newBoard, point, player.pointState);
    const capturedPoints = _getCapturedPoints(newBoard, point);
    capturedPoints.forEach((capture) =>
      _setPointStateAt(newBoard, capture, PointState.EMPTY)
    );

    const newCurrentBoardState: BoardState = {
      children: [],
      nextHint: null,
      back: boardsState.currentBoard,
      currentPlayer:
        player === boardsState.player1
          ? boardsState.player2
          : boardsState.player1,
      board: newBoard,
    };

    const error = _isValidMove(newCurrentBoardState, point);
    if (error !== undefined) {
      return error;
    }

    if (
      boardsState.currentBoard.children.push({
        move: point,
        state: newCurrentBoardState,
      }) === 1
    ) {
      boardsState.currentBoard.nextHint = newCurrentBoardState;
    }
  }

  export function moveBackwards(boardsState: BoardsState): void {
    const backBoardState = boardsState.currentBoard.back;
    if (backBoardState !== null) {
      backBoardState.nextHint = boardsState.currentBoard;
      boardsState.currentBoard = backBoardState;
    }
  }
  export function moveForward(boardsState: BoardsState): void {
    const nextBoardState = boardsState.currentBoard.nextHint;
    if (nextBoardState !== null) {
      boardsState.currentBoard = nextBoardState;
    }
  }
}
