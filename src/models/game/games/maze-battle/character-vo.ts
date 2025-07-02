import { DateVo } from '@/models/global/date-vo';
import { PositionJson, PositionVo } from './position-vo';
import { ItemJson, ItemVo } from './item-vo';

export type CharacterJson = {
  id: string;
  name: string;
  position: PositionJson;
  reachedGoadAt: string | null;
  color: string;
  heldItems: ItemJson[];
  reversed: boolean;
};

type Props = {
  id: string;
  name: string;
  position: PositionVo;
  reachedGoadAt: DateVo | null;
  color: string;
  heldItems: ItemVo[];
  reversed: boolean;
};

export class CharacterVo {
  private id: string;

  private name: string;

  private position: PositionVo;

  private reachedGoadAt: DateVo | null;

  private color: string;

  private heldItems: ItemVo[];

  private reversed: boolean;

  private constructor(props: Props) {
    this.id = props.id;
    this.name = props.name;
    this.position = props.position;
    this.reachedGoadAt = props.reachedGoadAt;
    this.color = props.color;
    this.heldItems = props.heldItems;
    this.reversed = props.reversed;
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
      color: json.color,
      heldItems: json.heldItems.map((item) => ItemVo.fromJson(item)),
      reversed: json.reversed,
    });
  }

  public toJson(): CharacterJson {
    return {
      id: this.id,
      name: this.name,
      position: this.position.toJson(),
      reachedGoadAt: this.reachedGoadAt ? this.reachedGoadAt.toString() : null,
      color: this.color,
      heldItems: this.heldItems.map((item) => item.toJson()),
      reversed: this.reversed,
    };
  }

  public getProps(): Props {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      reachedGoadAt: this.reachedGoadAt,
      color: this.color,
      heldItems: this.heldItems,
      reversed: this.reversed,
    };
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

  public getHeldItems(): ItemVo[] {
    return this.heldItems;
  }

  public getHeldItem(itemIndex: number): ItemVo | null {
    return this.heldItems[itemIndex] || null;
  }

  public addHeldItem(item: ItemVo): CharacterVo {
    return CharacterVo.create({ ...this.getProps(), heldItems: [...this.heldItems, item] });
  }

  public removeHeldItem(itemIndex: number): CharacterVo {
    return CharacterVo.create({
      ...this.getProps(),
      heldItems: this.heldItems.filter((_, index) => index !== itemIndex),
    });
  }

  public isReversed(): boolean {
    return this.reversed;
  }

  public setReversed(reversed: boolean): CharacterVo {
    return CharacterVo.create({ ...this.getProps(), reversed });
  }
}
