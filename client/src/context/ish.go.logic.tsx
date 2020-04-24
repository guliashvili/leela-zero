import { MoveError, Player, Point, PointState } from "./ish.go";
import { cloneDeep, isEqual } from "lodash";
type BoardState = {
  children: { move: Point; state: number }[];
  nextHint: number | null;
  back: number | null;
  currentPlayer: Player;
  board: PointState[][];
  index: number;
};
export type BoardsState = {
  player1: Player;
  player2: Player;
  boardSize: number;
  currentBoard: number;
  boards: BoardState[];
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
      currentBoard: 0,
      boards: [
        {
          children: [],
          nextHint: null,
          back: null,
          currentPlayer: player2,
          board,
          index: 0,
        },
      ],
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
  function _isUniqueBoard(
    boardState: BoardState,
    backBoardState: BoardState | null
  ): boolean {
    if (backBoardState === null) {
      console.log("ofc");
      return true;
    }
    return !isEqual(boardState.board, backBoardState.board);
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
    backBoardState: BoardState | null,
    point: Point
  ): MoveError | void {
    // Check for repeating board state
    if (!_isUniqueBoard(boardState, backBoardState)) {
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
    const currentBoard = boardsState.boards[boardsState.currentBoard];
    const child = currentBoard.children.find((child) =>
      isEqual(child.move, point)
    );
    if (child !== undefined) {
      boardsState.currentBoard = child.state;
      console.log("uh");
      return;
    }

    if (getPointStateAt(currentBoard.board, point) !== PointState.EMPTY) {
      console.log("ah");
      return MoveError.SUICIDE;
    }

    const player =
      currentBoard.currentPlayer === boardsState.player1
        ? boardsState.player2
        : boardsState.player1;
    const newBoard = cloneDeep(currentBoard.board);

    _setPointStateAt(newBoard, point, player.pointState);
    const capturedPoints = _getCapturedPoints(newBoard, point);
    capturedPoints.forEach((capture) =>
      _setPointStateAt(newBoard, capture, PointState.EMPTY)
    );

    const newCurrentBoardState: BoardState = {
      children: [],
      nextHint: null,
      back: boardsState.currentBoard,
      currentPlayer: player,
      board: newBoard,
      index: boardsState.boards.length,
    };

    const error = _isValidMove(
      newCurrentBoardState,
      currentBoard.back === null ? null : boardsState.boards[currentBoard.back],
      point
    );
    if (error !== undefined) {
      console.log("well,", error);
      return error;
    }

    if (
      currentBoard.children.push({
        move: point,
        state: boardsState.currentBoard =
          boardsState.boards.push(newCurrentBoardState) - 1,
      }) === 1
    ) {
      currentBoard.nextHint = currentBoard.nextHint ?? boardsState.currentBoard;
    }
    console.log("im here");
  }

  export function moveBackwards(boardsState: BoardsState): void {
    const currentBoard = boardsState.boards[boardsState.currentBoard];
    const backBoardState = currentBoard.back;
    if (backBoardState !== null) {
      boardsState.boards[backBoardState].nextHint = currentBoard.index;
      boardsState.currentBoard = backBoardState;
    }
  }
  export function moveForward(boardsState: BoardsState): void {
    const currentBoard = boardsState.boards[boardsState.currentBoard];
    boardsState.currentBoard =
      currentBoard.nextHint ?? boardsState.currentBoard;
  }
}
