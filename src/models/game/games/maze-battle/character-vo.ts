import { PositionJson, PositionVo } from './position-vo';

export type CharacterJson = {
  id: string;
  name: string;
  position: PositionJson;
};

type Props = {
  id: string;
  name: string;
  position: PositionVo;
};

export class CharacterVo {
  private id: string;

  private name: string;

  private position: PositionVo;

  private constructor(props: Props) {
    this.id = props.id;
    this.name = props.name;
    this.position = props.position;
  }

  static create(props: Props): CharacterVo {
    return new CharacterVo(props);
  }

  static fromJson(json: CharacterJson): CharacterVo {
    return new CharacterVo({ id: json.id, name: json.name, position: PositionVo.fromJson(json.position) });
  }

  public toJson(): CharacterJson {
    return { id: this.id, name: this.name, position: this.position.toJson() };
  }

  public getProps(): Props {
    return { id: this.id, name: this.name, position: this.position };
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
}
