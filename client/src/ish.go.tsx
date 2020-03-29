import { cloneDeep, isEqual } from "lodash-es";
import { View } from "./ish.go.view.h5";

export enum Color {
  BLACK,
  WHITE,
}

export enum PointState {
  EMPTY,
  BLACK,
  WHITE,
}

export enum MoveError {
  REPEAT = "The attempted move would result in a repeated board state.",
  OCCUPIED = "The selected intersection is occupied.",
  SUICIDE = "The attempted move would result in a suicide.",
}

export enum GameStatus {
  ACTIVE,
  IDLE,
  ENDED,
}

/**
 * OBJ: Defines changed points after a move is made.
 */
export class MoveResult {
  constructor(
    public readonly player: Player,
    public readonly newPoint: Point,
    public readonly capturedPoints: any
  ) {}
}

/**
 * OBJ: Defines common attributes for board points/intersections.
 */
export class Point {
  constructor(public readonly row: number, public readonly column: number) {}
  public getNeighborsAt(boardSize: number): Point[] {
    const steps = [
      [-1, 0],
      [0, -1],
      [1, 0],
      [0, 1],
    ];
    return steps
      .map((step) => new Point(this.row + step[0], this.column + step[1]))
      .filter(
        (point) =>
          Math.min(point.row, point.column) >= 0 &&
          Math.max(point.row, point.column) < boardSize
      );
  }
  public isInArray(array: Point[]): boolean {
    return (
      array.find(
        (point) => point.row === this.row && point.column === this.column
      ) !== undefined
    );
  }
}

/**
 * OBJ: Defines common attrib
 * utes for a player.
 */
export class Player {
  constructor(
    public readonly color: Color,
    public readonly pointState: PointState
  ) {}
}
