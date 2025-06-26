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
    <div
      className={twMerge(
        'w-full',
        'h-full',
        'flex',
        'flex-col',
        'relative',
        'rounded-3xl',
        'bg-white/5',
        'backdrop-blur-[20px]',
        'border',
        'border-white/10',
        'shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
        'overflow-auto'
      )}
    >
      <div className={twMerge('flex-1', 'p-5')}>
        <div className={twMerge('grid', 'grid-cols-[repeat(auto-fill,minmax(16rem,1fr))]', 'gap-4')}>
          {players.map((player) => {
            return (
              <div
                key={player.getId()}
                className="h-16 flex items-center gap-2 bg-white/10 backdrop-blur-[20px] border border-white/10 rounded-2xl p-2 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:bg-white/20 transition-all duration-200"
              >
                {player.getId() === hostPlayerId && <Icon icon="mdi:crown" className="w-4 h-4 text-white/90" />}
                <Text>{player.getName()}</Text>
                {player.getId() === myPlayerId && <Text>(You)</Text>}
              </div>
            );
          })}
        </div>
      </div>
      <footer className="h-20 flex items-center justify-center border-t border-white/20 bg-white/5 backdrop-blur-[20px]">
        {isMyPlayerHost && <Button text="Start Game" onClick={onStartGame} />}
      </footer>
    </div>
  );
}
