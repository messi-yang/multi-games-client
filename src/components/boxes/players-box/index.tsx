import { useState } from 'react';
import { Icon } from '@iconify/react';
import { GameModel } from '@/models/game/game-model';
import { PlayerModel } from '@/models/player/player-model';
import { Text } from '@/components/texts/text';
import { MessageModel } from '@/models/message/message-model';
import { Tabs } from '@/components/tabs';
import { Input } from '@/components/inputs/input';

type Props = {
  myPlayerId: string;
  hostPlayerId: string;
  game: GameModel;
  players: PlayerModel[];
  messages: MessageModel[];
  onSendMessage: (message: string) => void;
};

export function PlayersBox({ myPlayerId, hostPlayerId, game, players, messages, onSendMessage }: Props) {
  const [tab, setTab] = useState<'chat' | 'players'>('players');

  const [newMessage, setNewMessage] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div
      className="flex flex-col gap-4 w-full h-full rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.2)',
      }}
    >
      <div className="flex flex-row gap-4 w-full px-4 pt-2">
        <Tabs
          tabs={[
            { label: 'Chat', value: 'chat' },
            { label: 'Players', value: 'players' },
          ]}
          value={tab}
          onChange={(value) => setTab(value)}
        />
      </div>
      {tab === 'players' && (
        <div className="flex flex-col gap-4 w-full grow px-4 pb-2 overflow-y-auto">
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
      )}
      {tab === 'chat' && (
        <div className="flex flex-col grow w-full overflow-hidden">
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-4">
            {messages.map((message) => (
              <div key={message.getId()} className="flex flex-col gap-2">
                <div className="font-bold text-sm text-white/90">{message.getPlayerName()}</div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2 inline-block max-w-[80%] text-white/80 shadow-lg">
                  {message.getContent()}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/20 p-4">
            <div className="flex flex-col gap-2">
              <Input value={newMessage} onInput={(value) => setNewMessage(value)} placeholder="Type a message..." />
              <button
                type="submit"
                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-colors shadow-lg"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
