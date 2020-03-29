import { View } from "./ish.go.view.h5";
import {
  PointState,
  MoveError,
  Point,
  MoveResult,
  Player,
  Color,
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
  getChainPoints(point: Point, chainPoints: Point[]): Point[] {
    const pState = View.gGameState.getPointStateAt(point);
    chainPoints.push(point);

    for (const nPoint of point.getNeighborsAt(View.BOARD_SIZE)) {
      const nState = View.gGameState.getPointStateAt(nPoint);
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
      for (const nPoint of chainPoint.getNeighborsAt(View.BOARD_SIZE)) {
        const state = View.gGameState.getPointStateAt(nPoint);
        if (state === PointState.EMPTY) {
          libPoints.add(nPoint);
        }
      }
    }
    return libPoints.size;
  }
  getCapturedPoints(point: Point): Point[] {
    let capPoints: Point[] = [];
    const pState = View.gGameState.getPointStateAt(point);

    for (const nPoint of point.getNeighborsAt(View.BOARD_SIZE)) {
      const nState = View.gGameState.getPointStateAt(nPoint);
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

  isValidMove(point: Point, player: Player): boolean {
    // Check if point is empty
    if (View.gGameState.getPointStateAt(point) !== PointState.EMPTY) {
      View.gGameState.moveError = MoveError.OCCUPIED;
      return false;
    }

    let isValid = true;

    // Backup our board
    const backupBoard = View.gGameState.getBoardCopy();

    // Place piece
    View.gGameState.setPointStateAt(point, player.pointState);

    // Check for captured pieces
    const captures = this.getCapturedPoints(point);
    if (captures.length > 0) {
      // Remove captured pieces
      $.each(captures, function () {
        View.gGameState.setPointStateAt(this, PointState.EMPTY);
      });

      // Check for repeating board state
      if (!View.gGameState.isUniqueBoard()) {
        View.gGameState.moveError = MoveError.REPEAT;
        isValid = false;
      }
    } else if (this.getLibertyPoints(point) === 0) {
      View.gGameState.moveError = MoveError.SUICIDE;
      isValid = false;
    }

    // Restore our board
    View.gGameState.setBoardCopy(backupBoard);

    return isValid;
  }
  move(point: Point) {
    const player = View.gGameState.currentPlayer;

    // Clear previous move errors
    View.gGameState.moveError = "";

    // Validate move
    if (!this.isValidMove(point, player)) {
      return null;
    }

    // Store previous board
    View.gGameState.previousBoard = View.gGameState.getBoardCopy();

    // Place piece
    View.gGameState.setPointStateAt(point, player.pointState);

    // Remove captured pieces (if any)
    const capturedPoints = this.getCapturedPoints(point);
    $.each(capturedPoints, function () {
      View.gGameState.setPointStateAt(this, PointState.EMPTY);
    });

    // Change turn
    View.gGameState.currentPlayer =
      player == View.gGameState.player1
        ? View.gGameState.player2
        : View.gGameState.player1;

    return new MoveResult(player, point, capturedPoints);
  }

  newGame(boardSize: number) {
    View.gGameState = new GameState(
      boardSize,
      new Player(Color.BLACK, PointState.BLACK),
      new Player(Color.WHITE, PointState.WHITE)
    );
  }
}
