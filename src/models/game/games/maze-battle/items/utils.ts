import { DirectionReverserItemVo } from './direction-reverser-item-vo';
import { ItemNameEnum } from './item-name-enum';
import { ItemJson, ItemVo } from './item-vo';
import { PositionSwitcherItemVo } from './position-switcher-item-vo';

export function parseItemJson(json: ItemJson): ItemVo {
  if (json.name === ItemNameEnum.PositionSwitcher) {
    return PositionSwitcherItemVo.create();
  } else if (json.name === ItemNameEnum.DirectionReverser) {
    return DirectionReverserItemVo.create();
  }
  throw new Error(`Unknown item name: ${json.name}`);
}

export function createRandomItem(): ItemVo {
  const names = Object.values(ItemNameEnum);
  const randomIndex = Math.floor(Math.random() * names.length);

  const itemName = names[randomIndex];
  if (itemName === ItemNameEnum.PositionSwitcher) {
    return PositionSwitcherItemVo.create();
  } else if (itemName === ItemNameEnum.DirectionReverser) {
    return DirectionReverserItemVo.create();
  }
  throw new Error(`Unknown item name: ${itemName}`);
}
