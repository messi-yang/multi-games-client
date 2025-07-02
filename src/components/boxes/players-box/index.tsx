import { Icon } from '@iconify/react';
import { GameModel } from '@/models/game/game-model';
import { PlayerModel } from '@/models/player/player-model';
import { Text } from '@/components/texts/text';

type Props = {
  myPlayerId: string;
  hostPlayerId: string;
  game: GameModel;
  players: PlayerModel[];
};

export function PlayersBox({ myPlayerId, hostPlayerId, game, players }: Props) {
  return (
    <div
      className="flex flex-col gap-4 w-full h-full rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.2)',
      }}
    >
      {players.map((player) => (
        <div
          key={player.getId()}
          className="flex flex-col gap-2 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg p-4 rounded-2xl hover:bg-white/20 transition-all duration-300"
          style={{
            background: player.hasAccount()
              ? 'linear-gradient(135deg, rgba(255,0,0,0.2), rgba(255,165,0,0.2), rgba(255,255,0,0.2), rgba(0,255,0,0.2), rgba(0,0,255,0.2), rgba(75,0,130,0.2), rgba(238,130,238,0.2))'
              : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          }}
        >
          <div className="flex items-center gap-2 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
            {player.getId() === hostPlayerId && <Icon icon="mdi:crown" className="w-4 h-4 text-yellow-300/90" />}
            <Text>{`${player.getId() === myPlayerId ? '(You) ' : ''}${player.getName()}`}</Text>
          </div>

          <div className="flex justify-end">
            {game.hasStarted() && <Text size="text-xs">{game.isPlayerInGame(player.getId()) ? 'Playing' : 'Not Playing'}</Text>}
            {!game.hasStarted() && <Text size="text-xs">Waiting</Text>}
          </div>
        </div>
      ))}
    </div>
  );
}
