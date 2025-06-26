import { PositionVo } from './position-vo';
import { RoadVo } from './road-vo';
import { WallVo } from './wall-vo';

export type MazeJson = {
  width: number;
  height: number;
  cells: (1 | 0)[][];
};

type Props = {
  width: number;
  height: number;
  cells: (WallVo | RoadVo)[][];
};

type CreateProps = {
  width: number;
  height: number;
};

export class MazeVo {
  private width: number;

  private height: number;

  private cells: (WallVo | RoadVo)[][];

  private constructor(props: Props) {
    if (props.width % 2 === 0) {
      throw new Error('Width must be odd');
    }
    if (props.height % 2 === 0) {
      throw new Error('Height must be odd');
    }
    this.width = props.width;
    this.height = props.height;
    this.cells = props.cells;
  }

  static fromJson(json: MazeJson): MazeVo {
    return new MazeVo({
      width: json.width,
      height: json.height,
      cells: json.cells.map((row) => row.map((cell) => (cell === 1 ? WallVo.create() : RoadVo.create()))),
    });
  }

  static create(props: CreateProps): MazeVo {
    const cells: (WallVo | RoadVo)[][] = [];

    // Initialize the grid with walls
    for (let x = 0; x < props.width; x += 1) {
      if (!cells[x]) {
        cells[x] = [];
      }
      for (let y = 0; y < props.height; y += 1) {
        cells[x].push(WallVo.create());
      }
    }

    // Break walls to create paths
    const breakWalls = (x: number, y: number) => {
      if (x < 0 || x >= props.width || y < 0 || y >= props.height) return;
      if (cells[x][y] instanceof WallVo) {
        cells[x][y] = RoadVo.create();
      }
    };

    // Create maze using DFS or random approach
    const visited = Array.from({ length: props.height }, () => Array(props.width).fill(false));

    // Start point (1, 1) and end point (width - 2, height - 2)
    const startX = 1;
    const startY = 1;
    const endX = props.width - 2;
    const endY = props.height - 2;

    // Mark the start and end points as roads
    breakWalls(0, 1);
    breakWalls(startX, startY);
    breakWalls(endX, endY);
    breakWalls(props.width - 1, props.height - 2);

    // Directions: right, down, left, up (clockwise direction)
    const directions = [
      { dx: 1, dy: 0 }, // right
      { dx: 0, dy: 1 }, // down
      { dx: -1, dy: 0 }, // left
      { dx: 0, dy: -1 }, // up
    ];

    // Randomized DFS algorithm for maze generation
    const generateMaze = (x: number, y: number) => {
      visited[x][y] = true;

      // Shuffle directions to create randomness
      const shuffledDirections = directions.sort(() => Math.random() - 0.5);

      // Go through each direction
      for (let i = 0; i < shuffledDirections.length; i += 1) {
        const { dx, dy } = shuffledDirections[i];
        const newX = x + dx * 2;
        const newY = y + dy * 2;

        // Check if the new position is valid and unvisited
        if (newX >= 0 && newX < props.width && newY >= 0 && newY < props.height && !visited[newX][newY]) {
          // Break the wall between the current cell and the new cell
          breakWalls(x + dx, y + dy);
          breakWalls(newX, newY);

          // Recursively visit the new cell
          generateMaze(newX, newY);
        }
      }
    };

    // Start maze generation from the starting point (1, 1)
    generateMaze(startX, startY);

    // Return the MazeVo object with the generated cells
    return new MazeVo({ width: props.width, height: props.height, cells });
  }

  static load(props: Props): MazeVo {
    return new MazeVo(props);
  }

  public toJson(): MazeJson {
    return {
      width: this.width,
      height: this.height,
      cells: this.cells.map((row) => row.map((cell) => (cell instanceof WallVo ? 1 : 0))),
    };
  }

  public getStartPosition(): PositionVo {
    return PositionVo.create({ x: 0, y: 1 });
  }

  public getEndPosition(): PositionVo {
    return PositionVo.create({ x: this.width - 1, y: this.height - 2 });
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public getCells(): (WallVo | RoadVo)[] {
    return this.cells;
  }

  public getCell(position: PositionVo): WallVo | RoadVo | null {
    if (position.getX() < 0 || position.getX() >= this.width || position.getY() < 0 || position.getY() >= this.height) {
      return null;
    }
    return this.cells[position.getX()][position.getY()] ?? null;
  }

  public iterateCells(callback: (position: PositionVo, cell: WallVo | RoadVo) => void) {
    for (let x = 0; x < this.width; x += 1) {
      for (let y = 0; y < this.height; y += 1) {
        callback(PositionVo.create({ x, y }), this.cells[x][y]);
      }
    }
  }
}
