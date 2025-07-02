import { ItemNameEnum } from './item-name-enum';

export type ItemJson = {
  name: ItemNameEnum;
};

type Props = {
  name: ItemNameEnum;
};

export class ItemVo {
  private name: ItemNameEnum;

  private constructor(props: Props) {
    this.name = props.name;
  }

  static create(props: Props): ItemVo {
    return new ItemVo(props);
  }

  static createRandom(): ItemVo {
    const names = Object.values(ItemNameEnum);
    const randomIndex = Math.floor(Math.random() * names.length);
    return ItemVo.create({ name: names[randomIndex] });
  }

  static fromJson(json: ItemJson): ItemVo {
    return ItemVo.create({ name: json.name });
  }

  public toJson(): ItemJson {
    return { name: this.name };
  }

  public getName(): ItemNameEnum {
    return this.name;
  }
}
