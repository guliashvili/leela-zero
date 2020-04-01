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

/**
 * OBJ: Defines changed points after a move is made.
 */
export class Action {
  constructor(
    public readonly stateNow: PointState,
    public readonly stateBefore: PointState,
    public readonly point: Point
  ) {}
}
export class MoveResult {
  constructor(
    public readonly player: Player,
    public readonly actions: Action[]
  ) {}
}

/**
 * OBJ: Defines common attributes for board points/intersections.
 */
export class Point {
  constructor(public readonly row: number, public readonly column: number) {}
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
