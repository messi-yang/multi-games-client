import { ItemVo } from './item-vo';
import { ItemNameEnum } from './item-name-enum';

export class BlinderItemVo extends ItemVo {
  static create(): BlinderItemVo {
    return new BlinderItemVo();
  }

  public getName(): ItemNameEnum {
    return ItemNameEnum.Blinder;
  }

  public hasTargetCharacter(): boolean {
    return true;
  }
}
