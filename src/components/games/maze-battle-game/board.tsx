import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
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
import { ItemNameEnum } from '@/models/game/games/maze-battle/items/item-name-enum';
import { MazeBattleGameSwitchPositionCommand } from '@/models/game/games/maze-battle/commands/switch-position-command';
import { MazeBattleGameReverseDirectionCommand } from '@/models/game/games/maze-battle/commands/reverse-direction-command';
import { RoomService } from '@/services/room-service';
import { NotificationEventHandler } from '@/event-dispatchers/notification-event-handler';
import { MazeBattleGameCancelReverseCommand } from '@/models/game/games/maze-battle/commands/cancel-reverse-command';

type Props = {
  roomService: RoomService;
  myPlayerId: string;
  game: MazeBattleGameModel;
  gameState: MazeBattleGameStateVo;
  onCommand: (command: CommandModel<MazeBattleGameStateVo>) => void;
};

export function MazeBattleGameBoard({ roomService, myPlayerId, game, gameState, onCommand }: Props) {
  const notificationEventHandler = useMemo(() => NotificationEventHandler.create(), []);

  const gameId = useMemo(() => game.getId(), [game]);

  const maze = useMemo(() => gameState.getMaze(), [gameState]);

  const characters = useMemo(() => gameState.getCharacters(), [gameState]);

  const myCharacterId = useMemo(() => myPlayerId, [myPlayerId]);

  const myCharacter = useMemo(
    () => characters.find((character) => character.getId() === myCharacterId) || null,
    [characters, myCharacterId]
  );

  const otherCharacters = useMemo(() => characters.filter((character) => character.getId() !== myCharacterId), [characters, myCharacterId]);

  const itemBoxes = useMemo(() => gameState.getItemBoxes(), [gameState]);

  const [countdown, setCountdown] = useState<number>(gameState.getCountdown());

  useEffect(() => {
    if (gameState.isStarted()) {
      setCountdown(-1);
      return () => {};
    }

    const interval = setInterval(() => {
      setCountdown(gameState.getCountdown());

      if (gameState.isStarted()) {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [gameState]);

  const [direction, setDirection] = useState<DirectionEnum | null>(null);

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
        setDirection(DirectionEnum.Right);
      } else if (lastKey === 'ArrowLeft') {
        setDirection(DirectionEnum.Left);
      } else if (lastKey === 'ArrowUp') {
        setDirection(DirectionEnum.Up);
      } else if (lastKey === 'ArrowDown') {
        setDirection(DirectionEnum.Down);
      } else {
        setDirection(null);
      }
    },
    [move]
  );

  useHotKeys(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'], {
    onPressedKeysChange: handleArrowKeyPressed,
  });

  useEffect(() => {
    if (!direction) return () => {};

    move(direction);
    const interval = setInterval(() => {
      if (!direction) return;
      move(direction);
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [move, direction]);

  const useItem = useCallback(() => {
    if (!selectedCharacterId || !myCharacter) return;
    const item = myCharacter.getFirstHeldItem();
    if (!item) return;

    if (item.getName() === ItemNameEnum.PositionSwitcher) {
      onCommand(
        MazeBattleGameSwitchPositionCommand.create({
          gameId,
          playerId: myPlayerId,
          characterId: myCharacter.getId(),
          targetCharacterId: selectedCharacterId,
        })
      );
    } else if (item.getName() === ItemNameEnum.DirectionReverser) {
      onCommand(
        MazeBattleGameReverseDirectionCommand.create({
          gameId,
          playerId: myPlayerId,
          characterId: myCharacter.getId(),
          targetCharacterId: selectedCharacterId,
        })
      );
    }
  }, [selectedCharacterId, myCharacter, gameId, myPlayerId, onCommand]);

  const handleUseItemKeyDown = useCallback(
    (key: string) => {
      if (key === 'KeyZ') {
        useItem();
      }
    },
    [useItem]
  );

  useHotKeys(['KeyZ', 'KeyX'], {
    onKeyDown: handleUseItemKeyDown,
  });

  const cancelReverse = useCallback(() => {
    if (!myCharacterId) return;
    onCommand(MazeBattleGameCancelReverseCommand.create({ gameId, playerId: myPlayerId, characterId: myCharacterId }));
  }, [myCharacterId, gameId, myPlayerId, onCommand]);

  const cancelReverseDebouncer = useMemo(() => debounce(cancelReverse, 5000), [cancelReverse]);

  useEffect(() => {
    return roomService.subscribe('COMMAND_EXECUTED', (command) => {
      if (command instanceof MazeBattleGameReverseDirectionCommand) {
        const characterName = gameState.getCharacterName(command.getCharacterId());

        const targetCharacterId = command.getTargetCharacterId();
        const targetCharacterName = gameState.getCharacterName(targetCharacterId);

        notificationEventHandler.publishGeneralMessage(`${characterName} reversed ${targetCharacterName}'s direction!`);

        if (targetCharacterId === myCharacterId) {
          cancelReverseDebouncer();
        }
      } else if (command instanceof MazeBattleGameSwitchPositionCommand) {
        const characterName = gameState.getCharacterName(command.getCharacterId());

        const targetCharacterId = command.getTargetCharacterId();
        const targetCharacterName = gameState.getCharacterName(targetCharacterId);

        notificationEventHandler.publishGeneralMessage(`${characterName} switched position with ${targetCharacterName}!`);
      }
    });
  }, [roomService, notificationEventHandler, myCharacterId, gameState, cancelReverseDebouncer]);

  return (
    <div className={classnames('w-full', 'h-full', 'relative', 'overflow-hidden', 'flex', 'flex-row', 'p-4', 'gap-4')}>
      <div className="grow">
        <MazeCanvas maze={maze} characters={characters} myCharacter={myCharacter} itemBoxes={itemBoxes} countdown={countdown} />
      </div>
      <div className="w-64 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Text>You</Text>
          {myCharacter && <MazeBattleGameCharacterCard key={myCharacter.getId()} character={myCharacter} isMyCharacter selected={false} />}
        </div>
        <div className="flex flex-col gap-2">
          <Text>Other Players</Text>
          <div className="flex flex-col gap-2">
            {otherCharacters.map((character) => (
              <div className="flex flex-row gap-2 items-center" key={character.getId()}>
                <div className="grow">
                  <MazeBattleGameCharacterCard
                    key={character.getId()}
                    character={character}
                    isMyCharacter={myCharacterId === character.getId()}
                    selected={selectedCharacterId === character.getId()}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
