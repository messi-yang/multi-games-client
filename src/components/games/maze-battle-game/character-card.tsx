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
  isMyCharacter: boolean;
};

export function MazeBattleGameCharacterCard({ character, selected, isMyCharacter }: Props) {
  const firstHeldItem = useMemo(() => character.getHeldItems()[0], [character]);
  const secondHeldItem = useMemo(() => character.getHeldItems()[1], [character]);

  return (
    <div className={twMerge('flex items-center gap-2')}>
      <div
        className={twMerge('h-16 grow flex items-center gap-2 rounded-2xl px-3 py-2 backdrop-blur-sm border border-white/40')}
        style={{
          backgroundColor: `${character.getColor(80)}`,
        }}
      >
        {character.getReachedGoadAt() && <Icon icon="material-symbols:trophy" className="w-4 h-4 text-yellow-500" />}
        <div className="grow">
          <Text>{`${isMyCharacter ? '(YOU)' : ''} ${character.getName()}`}</Text>
        </div>
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
      {selected && (
        <div className="rounded-full bg-yellow-500 backdrop-blur-sm border border-white/20 flex items-center justify-center p-1">
          <Icon icon="solar:target-linear" className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}
