import Image from 'next/image';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Icon } from '@iconify/react';
import { Text } from '@/components/texts/text';
import { CharacterVo } from '@/models/game/games/maze-battle/character-vo';
import { ItemNameEnum } from '@/models/game/games/maze-battle/items/item-name-enum';

function ItemIcon({ itemName }: { itemName: ItemNameEnum }) {
  if (itemName === ItemNameEnum.DirectionReverser) {
    return <Image src="/assets/games/maze-battle/reverse.png" alt="Direction Reverser" width={20} height={20} />;
  } else if (itemName === ItemNameEnum.PositionSwitcher) {
    return <Image src="/assets/games/maze-battle/switch.png" alt="Position Switcher" width={20} height={20} />;
  }
  return null;
}

type Props = {
  character: CharacterVo;
  selected: boolean;
  isMyCharacter: boolean;
};

export function MazeBattleGameCharacterCard({ character, selected, isMyCharacter }: Props) {
  const firstHeldItem = useMemo(() => character.getFirstHeldItem(), [character]);
  const secondHeldItem = useMemo(() => character.getSecondHeldItem(), [character]);

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
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <ItemIcon itemName={firstHeldItem.getName()} />
            </div>
          )}
          {secondHeldItem && (
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-25">
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
