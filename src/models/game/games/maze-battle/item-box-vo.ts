import { ItemJson, ItemVo } from './items/item-vo';
import { parseItemJson } from './items/utils';
import { PositionJson, PositionVo } from './position-vo';

export type ItemBoxJson = {
  item: ItemJson;
  position: PositionJson;
};

type Props = {
  item: ItemVo;
  position: PositionVo;
};

export class ItemBoxVo {
  private item: ItemVo;

  private position: PositionVo;

  private constructor(props: Props) {
    this.item = props.item;
    this.position = props.position;
  }

  static create(props: Props): ItemBoxVo {
    return new ItemBoxVo(props);
  }

  static fromJson(json: ItemBoxJson): ItemBoxVo {
    return ItemBoxVo.create({ item: parseItemJson(json.item), position: PositionVo.fromJson(json.position) });
  }

  public toJson(): ItemBoxJson {
    return { item: this.item.toJson(), position: this.position.toJson() };
  }

  public getItem(): ItemVo {
    return this.item;
  }

  public getPosition(): PositionVo {
    return this.position;
  }
}
