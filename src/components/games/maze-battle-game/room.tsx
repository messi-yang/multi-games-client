import { twMerge } from 'tailwind-merge';
import { Icon } from '@iconify/react';
import { Text } from '@/components/texts/text';
import { PlayerModel } from '@/models/player/player-model';

type Props = {
  myPlayerId: string;
  hostPlayerId: string | null;
  players: PlayerModel[];
};

export function MazeBattleGameRoom({ myPlayerId, hostPlayerId, players }: Props) {
  return (
    <div className={twMerge('w-full', 'h-full', 'flex', 'flex-col', 'relative', 'rounded-3xl', 'overflow-auto')}>
      <div className={twMerge('flex-1', 'p-5')}>
        <div className={twMerge('grid', 'grid-cols-[repeat(auto-fill,minmax(16rem,1fr))]', 'gap-4')}>
          {players.map((player) => {
            return (
              <div key={player.getId()} className="h-16 flex items-center gap-2 rounded-2xl p-2">
                {player.getId() === hostPlayerId && <Icon icon="mdi:crown" className="w-4 h-4 text-white/90" />}
                <Text>{player.getName()}</Text>
                {player.getId() === myPlayerId && <Text>(You)</Text>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
