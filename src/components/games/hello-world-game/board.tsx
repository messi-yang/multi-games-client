import { useCallback, useMemo } from 'react';
import classnames from 'classnames';
import { Text } from '@/components/texts/text';
import { HelloWorldGameModel } from '@/models/game/games/hello-world/hello-world-game-model';
import { CommandModel } from '@/models/game/command-model';
import { HelloWorldGameStateJson } from '@/models/game/games/hello-world/hello-world-game-state-json';
import { HelloWorldGameSayHelloCommand } from '@/models/game/games/hello-world/commands/hello-world-game-say-hello-commands';
import { Button } from '@/components/buttons/button';

type Props = {
  myPlayerId: string;
  game: HelloWorldGameModel;
  onCommand: (command: CommandModel<HelloWorldGameStateJson>) => void;
  onRestart: () => void;
};

export function HelloWorldGameBoard({ myPlayerId, game, onCommand, onRestart }: Props) {
  const gameState = useMemo(() => game.getState(), [game]);

  const characters = useMemo(() => gameState.characters, [gameState]);

  const myCharacter = useMemo(() => characters.find((character) => character.id === myPlayerId), [characters, myPlayerId]);

  const handleSayHello = useCallback(() => {
    if (!myCharacter) return;
    onCommand(HelloWorldGameSayHelloCommand.create(game.getId(), myPlayerId, myCharacter.count + 1));
  }, [game, myPlayerId, myCharacter, onCommand]);

  return (
    <div className={classnames('w-full', 'h-full', 'relative', 'rounded-lg', 'overflow-hidden', 'bg-black', 'flex', 'flex-col')}>
      <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto">
        {characters.map((character) => (
          <div key={character.id} className="flex flex-col gap-2">
            <Text>{character.name}</Text>
            <Text>{`Said hello for ${character.count} times`}</Text>
            {character.id === myPlayerId && <Button text="Say hello" onClick={handleSayHello} />}
          </div>
        ))}
      </div>
      <footer className="h-20 flex items-center justify-center border-t border-white/20">
        <Button text="Restart" onClick={onRestart} />
      </footer>
    </div>
  );
}
