import { ItemVo } from './item-vo';
import { ItemNameEnum } from './item-name-enum';

export class PositionSwitcherItemVo extends ItemVo {
  static create(): PositionSwitcherItemVo {
    return new PositionSwitcherItemVo();
  }

  public getName(): ItemNameEnum {
    return ItemNameEnum.PositionSwitcher;
  }

  public hasTargetCharacter(): boolean {
    return true;
  }
}
