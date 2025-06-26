import { useCallback, useEffect, useMemo, useRef } from 'react';
import classnames from 'classnames';
import { MazeBattleGameModel } from '@/models/game/games/maze-battle/game-model';
import { CommandModel } from '@/models/game/command-model';
import { Button } from '@/components/buttons/button';
import { MazeBattleGameStateVo } from '@/models/game/games/maze-battle/game-state-vo';
import { MazeCanvas } from './maze-canvas';
import { MazeBattleGameMoveCommand } from '@/models/game/games/maze-battle/commands/move-commands';
import { useHotKeys } from '@/hooks/use-hot-keys';
import { DirectionEnum } from '@/models/game/games/maze-battle/direction-enum';

type Props = {
  hostPlayerId: string;
  myPlayerId: string;
  game: MazeBattleGameModel;
  gameState: MazeBattleGameStateVo;
  onCommand: (command: CommandModel<MazeBattleGameStateVo>) => void;
  onRestart: () => void;
};

export function MazeBattleGameBoard({ hostPlayerId, myPlayerId, game, gameState, onRestart, onCommand }: Props) {
  const gameId = useMemo(() => game.getId(), [game]);

  const maze = useMemo(() => gameState.getMaze(), [gameState]);

  const gameEnded = useMemo(() => gameState.isEnded(), [gameState]);

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
    <div className={classnames('w-full', 'h-full', 'relative', 'rounded-lg', 'overflow-hidden', 'bg-black', 'flex', 'flex-col')}>
      <div className="flex-1 w-full">
        <MazeCanvas maze={maze} characters={characters} />
      </div>
      <footer className="h-20 flex items-center justify-center border-t border-white/20">
        {hostPlayerId === myPlayerId && (
          <>
            {gameEnded && <Button text="Restart" onClick={onRestart} />}
            {!gameEnded && <Button text="Start Over" onClick={onRestart} />}
          </>
        )}
      </footer>
    </div>
  );
}
