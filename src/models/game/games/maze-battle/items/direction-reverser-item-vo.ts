import { ItemVo } from './item-vo';
import { ItemNameEnum } from './item-name-enum';

export class DirectionReverserItemVo extends ItemVo {
  static create(): DirectionReverserItemVo {
    return new DirectionReverserItemVo();
  }

  public getName(): ItemNameEnum {
    return ItemNameEnum.DirectionReverser;
  }

  public hasTargetCharacter(): boolean {
    return true;
  }
}
