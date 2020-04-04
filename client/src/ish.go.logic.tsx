import {
  Action,
  MoveError,
  MoveResult,
  Player,
  Point,
  PointState,
} from "./ish.go";
import { cloneDeep } from "lodash-es";

export class GameState {
  private board: PointState[][];
  public gameHistory: MoveResult[] = [];
  public currentPlayer: Player;
  constructor(
    public readonly boardSize: number,
    public readonly player1: Player,
    public readonly player2: Player
  ) {
    this.currentPlayer = player1;
    this.board = [];
    for (let i = 0; i < this.boardSize; i++) {
      this.board[i] = new Array(this.boardSize);
      for (let j = 0; j < this.boardSize; j++) {
        this.board[i][j] = PointState.EMPTY;
      }
    }
  }
  getBoardSize(): number {
    return this.board.length;
  }
  getPointStateAt(point: Point): PointState {
    return this.board[point.column][point.row];
  }
  setPointStateAt(point: Point, pointState: PointState): void {
    this.board[point.column][point.row] = pointState;
  }
  isUniqueBoard(): boolean {
    const first = this.gameHistory[this.gameHistory.length - 2];
    const second = this.gameHistory[this.gameHistory.length - 1];
    if (
      first === undefined ||
      second === undefined ||
      first.actions.length !== 2 ||
      second.actions.length !== 2
    ) {
      return true;
    }
    const removed1 = first.actions.filter(
      (action) => action.stateNow === PointState.EMPTY
    )[0].point;
    const added1 = first.actions.filter(
      (action) => action.stateNow !== PointState.EMPTY
    )[0].point;
    if (removed1 === null || added1 === null) {
      return true;
    }
    const removed2 = second.actions.filter(
      (action) => action.stateNow === PointState.EMPTY
    )[0].point;
    const added2 = second.actions.filter(
      (action) => action.stateNow !== PointState.EMPTY
    )[0].point;
    if (removed2 === null || added2 === null) {
      return true;
    }

    return !(
      removed2.column === added1.column &&
      removed2.row === added1.row &&
      added2.column === removed1.column &&
      added2.row === removed1.row
    );
  }
  setBoardCopy(board: PointState[][]): void {
    this.board = cloneDeep(board);
  }
  getNeighborsAt(point: Point): Point[] {
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
          Math.max(point.row, point.column) < this.getBoardSize()
      );
  }
  getChainPoints(point: Point, chainPoints: Point[]): Point[] {
    const pState = this.getPointStateAt(point);
    chainPoints.push(point);

    for (const nPoint of this.getNeighborsAt(point)) {
      const nState = this.getPointStateAt(nPoint);
      if (pState === nState && !nPoint.isInArray(chainPoints)) {
        this.getChainPoints(nPoint, chainPoints);
      }
    }
    return chainPoints;
  }
  getLibertyPoints(point: Point): number {
    const chain = this.getChainPoints(point, []);
    const libPoints = new Set();
    for (const chainPoint of chain) {
      for (const nPoint of this.getNeighborsAt(chainPoint)) {
        const state = this.getPointStateAt(nPoint);
        if (state === PointState.EMPTY) {
          libPoints.add(nPoint);
        }
      }
    }
    return libPoints.size;
  }
  getCapturedPoints(point: Point): Point[] {
    let capPoints: Point[] = [];
    const pState = this.getPointStateAt(point);

    for (const nPoint of this.getNeighborsAt(point)) {
      const nState = this.getPointStateAt(nPoint);
      if (nState !== pState && nState !== PointState.EMPTY) {
        if (
          !nPoint.isInArray(capPoints) &&
          this.getLibertyPoints(nPoint) === 0
        ) {
          const chain = this.getChainPoints(nPoint, []);
          capPoints = capPoints.concat(chain);
        }
      }
    }
    return capPoints;
  }

  isValidMove(): MoveError | void {
    // Check if point is empty
    const actions = this.gameHistory[this.gameHistory.length - 1];
    if (
      actions.actions.some(
        (action) =>
          action.stateBefore !== PointState.EMPTY &&
          action.stateNow !== PointState.EMPTY
      )
    ) {
      return MoveError.OCCUPIED;
    }

    // Check for repeating board state
    if (!this.isUniqueBoard()) {
      return MoveError.REPEAT;
    }
    if (
      actions.actions.some((action) => {
        if (
          action.stateBefore === PointState.EMPTY &&
          action.stateNow !== PointState.EMPTY
        ) {
          return this.getLibertyPoints(action.point) === 0;
        }
        return false;
      })
    ) {
      return MoveError.SUICIDE;
    }
  }
  move(point: Point): MoveResult | MoveError {
    const player = this.currentPlayer;
    const actionPlace = new Action(
      this.currentPlayer.pointState,
      this.getPointStateAt(point),
      point
    );
    this.setPointStateAt(point, player.pointState);

    const capturedPoints = this.getCapturedPoints(point);
    const actionCapture = capturedPoints.map(
      (capturedPoint) =>
        new Action(
          PointState.EMPTY,
          this.getPointStateAt(capturedPoint),
          capturedPoint
        )
    );
    capturedPoints.forEach((capture) =>
      this.setPointStateAt(capture, PointState.EMPTY)
    );

    this.currentPlayer = player === this.player1 ? this.player2 : this.player1;
    const moveResult = new MoveResult(player, [...actionCapture, actionPlace]);
    this.gameHistory.push(moveResult);
    const moveError = this.isValidMove();
    if (moveError !== undefined) {
      this.moveBackwards();
      return moveError;
    }
    return moveResult;
  }
  moveBackwards(): MoveResult | null {
    const lastMove = this.gameHistory.pop();
    if (lastMove === undefined) {
      return null;
    }
    this.currentPlayer = lastMove.player;
    return new MoveResult(
      lastMove.player,
      lastMove.actions.map((action) => {
        this.setPointStateAt(action.point, action.stateBefore);
        return new Action(action.stateBefore, action.stateNow, action.point);
      })
    );
  }
}
