import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Icon } from '@iconify/react';
import { Text } from '@/components/texts/text';
import { PlayerModel } from '@/models/player/player-model';
import { Button } from '@/components/buttons/button';

type Props = {
  myPlayerId: string;
  hostPlayerId: string | null;
  players: PlayerModel[];
  onStartGame: () => void;
};

export function MazeBattleGameRoom({ myPlayerId, hostPlayerId, players, onStartGame }: Props) {
  const isMyPlayerHost = useMemo(() => myPlayerId === hostPlayerId, [myPlayerId, hostPlayerId]);

  return (
    <div className={twMerge('w-full', 'h-full', 'flex', 'flex-col', 'relative', 'rounded-lg', 'backdrop-blur', 'px-5', 'overflow-auto')}>
      <div className={twMerge('flex-1', 'py-5')}>
        <div className={twMerge('grid', 'grid-cols-[repeat(auto-fill,minmax(16rem,1fr))]', 'gap-4')}>
          {players.map((player) => {
            return (
              <div key={player.getId()} className="h-16 flex items-center gap-2 border border-white rounded-lg p-2">
                {player.getId() === hostPlayerId && <Icon icon="mdi:crown" className="w-4 h-4 text-white" />}
                <Text>{player.getName()}</Text>
                {player.getId() === myPlayerId && <Text>(You)</Text>}
              </div>
            );
          })}
        </div>
      </div>
      <footer className="h-20 flex items-center justify-center border-t border-white/20">
        {isMyPlayerHost && <Button text="Start Game" onClick={onStartGame} />}
      </footer>
    </div>
  );
}
