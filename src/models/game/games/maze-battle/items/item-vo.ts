import { ItemNameEnum } from './item-name-enum';

export type ItemJson = {
  name: ItemNameEnum;
};

export abstract class ItemVo {
  public toJson(): ItemJson {
    return { name: this.getName() };
  }

  public abstract getName(): ItemNameEnum;

  public abstract hasTargetCharacter(): boolean;
}
