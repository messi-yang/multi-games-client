import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Icon } from '@iconify/react';
import { Text } from '@/components/texts/text';
import { CharacterVo } from '@/models/game/games/maze-battle/character-vo';
import { ItemNameEnum } from '@/models/game/games/maze-battle/item-name-enum';

function ItemIcon({ itemName }: { itemName: ItemNameEnum }) {
  if (itemName === ItemNameEnum.DirectionReverser) {
    return <Icon icon="ic:baseline-compare-arrows" className="w-4 h-4" />;
  } else if (itemName === ItemNameEnum.PositionSwitcher) {
    return <Icon icon="ic:baseline-switch-access-shortcut" className="w-4 h-4" />;
  }
  return null;
}

type Props = {
  character: CharacterVo;
  selected: boolean;
};

export function MazeBattleGameCharacterCard({ character, selected }: Props) {
  const firstHeldItem = useMemo(() => character.getHeldItems()[0], [character]);
  const secondHeldItem = useMemo(() => character.getHeldItems()[1], [character]);

  return (
    <div
      className={twMerge('h-16 flex items-center gap-2 rounded-2xl p-2 bg-white/10 backdrop-blur-sm', selected && 'border border-white/40')}
    >
      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: character.getColor() }} />
      {character.getReachedGoadAt() && <Icon icon="material-symbols:trophy" className="w-4 h-4 text-yellow-500" />}
      <Text>{character.getName()}</Text>
      <div className="flex flex-row gap-2">
        {firstHeldItem && (
          <div className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <ItemIcon itemName={firstHeldItem.getName()} />
          </div>
        )}
        {secondHeldItem && (
          <div className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <ItemIcon itemName={secondHeldItem.getName()} />
          </div>
        )}
      </div>
    </div>
  );
}
