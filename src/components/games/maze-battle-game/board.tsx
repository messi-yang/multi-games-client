import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classnames from 'classnames';
import { MazeBattleGameModel } from '@/models/game/games/maze-battle/game-model';
import { CommandModel } from '@/models/game/command-model';
import { MazeBattleGameStateVo } from '@/models/game/games/maze-battle/game-state-vo';
import { MazeCanvas } from './maze-canvas';
import { MazeBattleGameMoveCommand } from '@/models/game/games/maze-battle/commands/move-commands';
import { useHotKeys } from '@/hooks/use-hot-keys';
import { DirectionEnum } from '@/models/game/games/maze-battle/direction-enum';
import { Text } from '@/components/texts/text';
import { MazeBattleGameCharacterCard } from './character-card';
import { ItemNameEnum } from '@/models/game/games/maze-battle/item-name-enum';
import { MazeBattleGameSwitchPositionCommand } from '@/models/game/games/maze-battle/commands/switch-position-command';
import { MazeBattleGameReverseDirectionCommand } from '@/models/game/games/maze-battle/commands/reverse-direction-command';

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

  const sortedCharacters = useMemo(() => {
    return characters.sort((a, b) => {
      if (a.getReachedGoadAt() && !b.getReachedGoadAt()) return -1;
      if (!a.getReachedGoadAt() && b.getReachedGoadAt()) return 1;
      return 0;
    });
  }, [characters]);

  const myCharacterId = useMemo(() => myPlayerId, [myPlayerId]);

  const myCharacter = useMemo(
    () => characters.find((character) => character.getId() === myCharacterId) || null,
    [characters, myCharacterId]
  );

  const otherCharacters = useMemo(() => characters.filter((character) => character.getId() !== myCharacterId), [characters, myCharacterId]);

  const itemBoxes = useMemo(() => gameState.getItemBoxes(), [gameState]);

  const directionRef = useRef<DirectionEnum | null>(null);

  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedCharacterId && otherCharacters.length > 0) {
      setSelectedCharacterId(otherCharacters[0].getId());
    } else if (selectedCharacterId && !otherCharacters.some((character) => character.getId() === selectedCharacterId)) {
      setSelectedCharacterId(null);
    }
  }, [selectedCharacterId, otherCharacters]);

  const selectNextCharacter = useCallback(() => {
    if (!selectedCharacterId || otherCharacters.length === 0) return;
    const currentIndex = otherCharacters.findIndex((character) => character.getId() === selectedCharacterId);
    const nextIndex = (currentIndex + 1) % otherCharacters.length;
    setSelectedCharacterId(otherCharacters[nextIndex].getId());
  }, [selectedCharacterId, otherCharacters]);

  const handleSpaceKeyDown = useCallback(() => {
    selectNextCharacter();
  }, [selectNextCharacter]);

  useHotKeys(['Space'], {
    onKeyDown: handleSpaceKeyDown,
  });

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

  const useItem = useCallback(
    (itemIndex: number) => {
      if (!selectedCharacterId || !myCharacter) return;
      const item = myCharacter.getHeldItem(itemIndex);
      if (!item) return;

      if (item.getName() === ItemNameEnum.PositionSwitcher) {
        onCommand(
          MazeBattleGameSwitchPositionCommand.create({
            gameId,
            playerId: myPlayerId,
            characterId: myCharacter.getId(),
            itemIndex,
            targetCharacterId: selectedCharacterId,
          })
        );
      } else if (item.getName() === ItemNameEnum.DirectionReverser) {
        onCommand(
          MazeBattleGameReverseDirectionCommand.create({
            gameId,
            playerId: myPlayerId,
            characterId: myCharacter.getId(),
            itemIndex,
            targetCharacterId: selectedCharacterId,
          })
        );
      }
    },
    [selectedCharacterId, myCharacter, gameId, myPlayerId, onCommand]
  );

  const handleUseItemKeyDown = useCallback(
    (key: string) => {
      if (key === 'KeyZ') {
        useItem(0);
      } else if (key === 'KeyX') {
        useItem(1);
      }
    },
    [useItem]
  );

  useHotKeys(['KeyZ', 'KeyX'], {
    onKeyDown: handleUseItemKeyDown,
  });

  return (
    <div className={classnames('w-full', 'h-full', 'relative', 'overflow-hidden', 'flex', 'flex-row', 'p-4', 'gap-4')}>
      <div className="grow">
        <MazeCanvas maze={maze} myCharacter={myCharacter} characters={characters} itemBoxes={itemBoxes} />
      </div>
      <div className="w-64 flex flex-col gap-4">
        <Text>Players</Text>
        <div className="flex flex-col gap-2">
          {sortedCharacters.map((character) => (
            <MazeBattleGameCharacterCard
              key={character.getId()}
              character={character}
              selected={character.getId() === selectedCharacterId}
              isMyCharacter={myCharacterId === character.getId()}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
