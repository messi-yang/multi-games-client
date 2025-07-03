export type PositionJson = {
  x: number;
  y: number;
};

type Props = {
  x: number;
  y: number;
};

export class PositionVo {
  private x: number;

  private y: number;

  private constructor(props: Props) {
    this.x = props.x;
    this.y = props.y;
  }

  static create(props: Props): PositionVo {
    return new PositionVo(props);
  }

  static fromJson(json: PositionJson): PositionVo {
    return new PositionVo({ x: json.x, y: json.y });
  }

  public toJson(): PositionJson {
    return { x: this.x, y: this.y };
  }

  public equals(other: PositionVo): boolean {
    return this.x === other.x && this.y === other.y;
  }

  public shift(x: number, y: number): PositionVo {
    return PositionVo.create({ x: this.x + x, y: this.y + y });
  }

  public getX(): number {
    return this.x;
  }

  public getY(): number {
    return this.y;
  }

  public toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}
