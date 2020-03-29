import {
  PointState,
  MoveError,
  Point,
  MoveResult,
  Player,
  GameStatus,
} from "./ish.go";
import { cloneDeep, isEqual } from "lodash-es";

export class GameState {
  public status = GameStatus.ACTIVE;
  private board: PointState[][];
  public previousBoard: PointState[][];
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
    this.previousBoard = cloneDeep(this.board);
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
    return !isEqual(this.board, this.previousBoard);
  }
  getBoardCopy(): PointState[][] {
    const ret = cloneDeep(this.board);
    return ret;
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

  isValidMove(point: Point, player: Player): MoveError | void {
    // Check if point is empty
    if (this.getPointStateAt(point) !== PointState.EMPTY) {
      return MoveError.OCCUPIED;
    }

    // Backup our board
    const backupBoard = this.getBoardCopy();

    // Place piece
    this.setPointStateAt(point, player.pointState);

    // Check for captured pieces
    const captures = this.getCapturedPoints(point);
    if (captures.length > 0) {
      // Remove captured pieces
      captures.forEach((capture) =>
        this.setPointStateAt(capture, PointState.EMPTY)
      );

      // Check for repeating board state
      if (!this.isUniqueBoard()) {
        return MoveError.REPEAT;
      }
    } else if (this.getLibertyPoints(point) === 0) {
      return MoveError.SUICIDE;
    }

    // Restore our board
    this.setBoardCopy(backupBoard);
  }
  move(point: Point): MoveResult | MoveError {
    const player = this.currentPlayer;

    // Validate move
    const moveError = this.isValidMove(point, player);
    if (moveError) {
      return moveError;
    }

    // Store previous board
    this.previousBoard = this.getBoardCopy();

    // Place piece
    this.setPointStateAt(point, player.pointState);

    // Remove captured pieces (if any)
    const capturedPoints = this.getCapturedPoints(point);
    capturedPoints.forEach((capture) =>
      this.setPointStateAt(capture, PointState.EMPTY)
    );

    // Change turn
    this.currentPlayer = player === this.player1 ? this.player2 : this.player1;

    return new MoveResult(player, point, capturedPoints);
  }
}
