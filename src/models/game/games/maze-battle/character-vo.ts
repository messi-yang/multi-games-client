import { DateVo } from '@/models/global/date-vo';
import { PositionJson, PositionVo } from './position-vo';
import { getRandomColor } from './utils';

export type CharacterJson = {
  id: string;
  name: string;
  position: PositionJson;
  reachedGoadAt: string | null;
  color: string;
};

type Props = {
  id: string;
  name: string;
  position: PositionVo;
  reachedGoadAt: DateVo | null;
  color: string;
};

export class CharacterVo {
  private id: string;

  private name: string;

  private position: PositionVo;

  private reachedGoadAt: DateVo | null;

  private color: string;

  private constructor(props: Props) {
    this.id = props.id;
    this.name = props.name;
    this.position = props.position;
    this.reachedGoadAt = props.reachedGoadAt;
    this.color = props.color;
  }

  static create(props: Props): CharacterVo {
    return new CharacterVo(props);
  }

  static fromJson(json: CharacterJson): CharacterVo {
    return new CharacterVo({
      id: json.id,
      name: json.name,
      position: PositionVo.fromJson(json.position),
      reachedGoadAt: json.reachedGoadAt ? DateVo.parseString(json.reachedGoadAt) : null,
      color: json.color.length === 6 ? json.color : getRandomColor(),
    });
  }

  public toJson(): CharacterJson {
    return {
      id: this.id,
      name: this.name,
      position: this.position.toJson(),
      reachedGoadAt: this.reachedGoadAt ? this.reachedGoadAt.toString() : null,
      color: this.color,
    };
  }

  public getProps(): Props {
    return { id: this.id, name: this.name, position: this.position, reachedGoadAt: this.reachedGoadAt, color: this.color };
  }

  public getName(): string {
    return this.name;
  }

  public getId(): string {
    return this.id;
  }

  public getPosition(): PositionVo {
    return this.position;
  }

  public updatePosition(position: PositionVo): CharacterVo {
    return CharacterVo.create({ ...this.getProps(), position });
  }

  public getReachedGoadAt(): DateVo | null {
    return this.reachedGoadAt;
  }

  public setReachedGoadAt(reachedGoadAt: DateVo): CharacterVo {
    return CharacterVo.create({ ...this.getProps(), reachedGoadAt });
  }

  public getColor(): string {
    return this.color;
  }
}
