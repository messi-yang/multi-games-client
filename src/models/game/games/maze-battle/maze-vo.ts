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

  public toJson(): MazeJson {
    return {
      width: this.width,
      height: this.height,
      cells: this.cells.map((row) => row.map((cell) => (cell instanceof WallVo ? 1 : 0))),
    };
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

    // Initialize disjoint set for Kruskal's algorithm
    const parent: number[] = [];
    const rank: number[] = [];

    const find = (x: number): number => {
      if (parent[x] !== x) {
        parent[x] = find(parent[x]);
      }
      return parent[x];
    };

    const union = (x: number, y: number) => {
      const rootX = find(x);
      const rootY = find(y);

      if (rootX !== rootY) {
        if (rank[rootX] < rank[rootY]) {
          parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
          parent[rootY] = rootX;
        } else {
          parent[rootY] = rootX;
          rank[rootX] += 1;
        }
      }
    };

    // Create list of all possible walls that can be removed
    const walls: { x: number; y: number; dx: number; dy: number }[] = [];
    for (let x = 1; x < props.width - 1; x += 2) {
      for (let y = 1; y < props.height - 1; y += 2) {
        // Make cells at odd coordinates into rooms
        cells[x][y] = RoadVo.create();
        const cellId = x * props.height + y;
        parent[cellId] = cellId;
        rank[cellId] = 0;

        // Add walls to the right and down
        if (x + 2 < props.width - 1) {
          walls.push({ x, y, dx: 2, dy: 0 });
        }
        if (y + 2 < props.height - 1) {
          walls.push({ x, y, dx: 0, dy: 2 });
        }
      }
    }

    // Shuffle walls randomly
    for (let i = walls.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [walls[i], walls[j]] = [walls[j], walls[i]];
    }

    // Process each wall using Kruskal's algorithm
    walls.forEach(({ x, y, dx, dy }) => {
      const cell1 = x * props.height + y;
      const cell2 = (x + dx) * props.height + (y + dy);

      if (find(cell1) !== find(cell2)) {
        union(cell1, cell2);
        cells[x + dx / 2][y + dy / 2] = RoadVo.create();
        cells[x + dx][y + dy] = RoadVo.create();
      }
    });

    // Create entrance and exit
    cells[0][1] = RoadVo.create();
    cells[props.width - 1][props.height - 2] = RoadVo.create();

    return new MazeVo({ width: props.width, height: props.height, cells });
  }

  static load(props: Props): MazeVo {
    return new MazeVo(props);
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

  public getRandomRoadPositions(count: number): PositionVo[] {
    const roadPositions: PositionVo[] = [];
    this.iterateCells((position, cell) => {
      if (cell instanceof RoadVo) {
        roadPositions.push(position);
      }
    });

    const randomRoadPositions: PositionVo[] = [];
    while (randomRoadPositions.length < count) {
      const randomIndex = Math.floor(Math.random() * roadPositions.length);
      const randomRoadPosition = roadPositions[randomIndex];
      if (randomRoadPositions.some((position) => position.equals(randomRoadPosition))) {
        continue;
      }
      randomRoadPositions.push(randomRoadPosition);
    }
    return randomRoadPositions;
  }
}
