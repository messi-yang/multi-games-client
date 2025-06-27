import { useCallback, useEffect, useMemo, useRef } from 'react';
import classnames from 'classnames';
import { MazeBattleGameModel } from '@/models/game/games/maze-battle/game-model';
import { CommandModel } from '@/models/game/command-model';
import { MazeBattleGameStateVo } from '@/models/game/games/maze-battle/game-state-vo';
import { MazeCanvas } from './maze-canvas';
import { MazeBattleGameMoveCommand } from '@/models/game/games/maze-battle/commands/move-commands';
import { useHotKeys } from '@/hooks/use-hot-keys';
import { DirectionEnum } from '@/models/game/games/maze-battle/direction-enum';
import { Text } from '@/components/texts/text';

type Props = {
  myPlayerId: string;
  game: MazeBattleGameModel;
  gameState: MazeBattleGameStateVo;
  onCommand: (command: CommandModel<MazeBattleGameStateVo>) => void;
};

export function MazeBattleGameBoard({ myPlayerId, game, gameState, onCommand }: Props) {
  const gameId = useMemo(() => game.getId(), [game]);

  const maze = useMemo(() => gameState.getMaze(), [gameState]);

  const characters = useMemo(() => gameState.getCharacters(), [gameState]);

  const directionRef = useRef<DirectionEnum | null>(null);

  const move = useCallback(
    (dir: 'left' | 'right' | 'up' | 'down') => {
      if (!dir) return;
      switch (dir) {
        case 'left':
          onCommand(MazeBattleGameMoveCommand.create({ gameId, playerId: myPlayerId, direction: DirectionEnum.Left }));
          break;
        case 'right':
          onCommand(MazeBattleGameMoveCommand.create({ gameId, playerId: myPlayerId, direction: DirectionEnum.Right }));
          break;
        case 'up':
          onCommand(MazeBattleGameMoveCommand.create({ gameId, playerId: myPlayerId, direction: DirectionEnum.Up }));
          break;
        case 'down':
          onCommand(MazeBattleGameMoveCommand.create({ gameId, playerId: myPlayerId, direction: DirectionEnum.Down }));
          break;
        default:
          break;
      }
    },
    [gameId, myPlayerId, onCommand]
  );

  const handleArrowKeyPressed = useCallback(
    (keys: string[]) => {
      const lastKey = keys[keys.length - 1];
      if (lastKey === 'ArrowRight') {
        directionRef.current = DirectionEnum.Right;
      } else if (lastKey === 'ArrowLeft') {
        directionRef.current = DirectionEnum.Left;
      } else if (lastKey === 'ArrowUp') {
        directionRef.current = DirectionEnum.Up;
      } else if (lastKey === 'ArrowDown') {
        directionRef.current = DirectionEnum.Down;
      } else {
        directionRef.current = null;
      }
    },
    [move]
  );

  useHotKeys(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'], {
    onPressedKeysChange: handleArrowKeyPressed,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (!directionRef.current) return;
      move(directionRef.current);
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [move]);

  return (
    <div className={classnames('w-full', 'h-full', 'relative', 'overflow-hidden', 'flex', 'flex-row')}>
      <div className="w-40 p-4 flex flex-col gap-4">
        <Text>Characters</Text>
        <div className="flex flex-col gap-2">
          {characters.map((character) => (
            <div key={character.getId()} className="flex flex-row gap-2 items-center">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: character.getColor() }} />
              <Text>{character.getName()}</Text>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 w-full">
        <MazeCanvas maze={maze} characters={characters} />
      </div>
      <div className="w-40 p-4 flex flex-col gap-4">
        <Text>Winners</Text>
        <div className="flex flex-col gap-2">
          {gameState.getWinners().map((winner, winnerIndex) => (
            <Text key={winner.getId()}>
              {winnerIndex + 1}. {winner.getName()}
            </Text>
          ))}
        </div>
      </div>
    </div>
  );
}
