import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import classnames from 'classnames';
import { MazeBattleGameModel } from '@/models/game/games/maze-battle/game-model';
import { CommandModel } from '@/models/game/command-model';
import { MazeBattleGameStateModel } from '@/models/game/games/maze-battle/game-state-model';
import { MazeCanvas } from './maze-canvas';
import { MoveMazeBattleCommandModel } from '@/models/game/games/maze-battle/commands/move-commands-model';
import { useHotKeys } from '@/hooks/use-hot-keys';
import { DirectionEnum } from '@/models/game/games/maze-battle/direction-enum';
import { Text } from '@/components/texts/text';
import { MazeBattleGameCharacterCard } from './character-card';
import { ItemNameEnum } from '@/models/game/games/maze-battle/items/item-name-enum';
import { SwitchPositionMazeBattleCommandModel } from '@/models/game/games/maze-battle/commands/switch-position-command-model';
import { ReverseDirectionMazeBattleCommandModel } from '@/models/game/games/maze-battle/commands/reverse-direction-command-model';
import { RoomService } from '@/services/room-service';
import { NotificationEventHandler } from '@/event-dispatchers/notification-event-handler';
import { CancelReverseMazeBattleCommandModel } from '@/models/game/games/maze-battle/commands/cancel-reverse-command-model';
import { CharacterVo } from '@/models/game/games/maze-battle/character-vo';

type Props = {
  roomService: RoomService;
  myPlayerId: string;
  game: MazeBattleGameModel;
  gameState: MazeBattleGameStateModel;
  onCommand: (command: CommandModel<MazeBattleGameStateModel>) => void;
};

export function MazeBattleGameBoard({ roomService, myPlayerId, game, gameState, onCommand }: Props) {
  const notificationEventHandler = useMemo(() => NotificationEventHandler.create(), []);

  const gameId = useMemo(() => game.getId(), [game]);

  const [characters, setCharacters] = useState<CharacterVo[]>([]);

  useEffect(() => {
    setCharacters(gameState.getCharacters());

    return gameState.subscribeCharacterUpdatedEvent((character) => {
      setCharacters((prevCharacters) => prevCharacters.map((c) => (c.getId() === character.getId() ? character : c)));
    });
  }, [gameState]);

  const myCharacterId = useMemo(() => myPlayerId, [myPlayerId]);

  const myCharacter = useMemo(
    () => characters.find((character) => character.getId() === myCharacterId) ?? null,
    [characters, myCharacterId]
  );

  const otherCharacters = useMemo(() => characters.filter((character) => character.getId() !== myCharacterId), [characters, myCharacterId]);

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
          onCommand(MoveMazeBattleCommandModel.create({ gameId, playerId: myPlayerId, direction: DirectionEnum.Left }));
          break;
        case 'right':
          onCommand(MoveMazeBattleCommandModel.create({ gameId, playerId: myPlayerId, direction: DirectionEnum.Right }));
          break;
        case 'up':
          onCommand(MoveMazeBattleCommandModel.create({ gameId, playerId: myPlayerId, direction: DirectionEnum.Up }));
          break;
        case 'down':
          onCommand(MoveMazeBattleCommandModel.create({ gameId, playerId: myPlayerId, direction: DirectionEnum.Down }));
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
        SwitchPositionMazeBattleCommandModel.create({
          gameId,
          playerId: myPlayerId,
          characterId: myCharacter.getId(),
          targetCharacterId: selectedCharacterId,
        })
      );
    } else if (item.getName() === ItemNameEnum.DirectionReverser) {
      onCommand(
        ReverseDirectionMazeBattleCommandModel.create({
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
    onCommand(CancelReverseMazeBattleCommandModel.create({ gameId, playerId: myPlayerId, characterId: myCharacterId }));
  }, [myCharacterId, gameId, myPlayerId, onCommand]);

  const cancelReverseDebouncer = useMemo(() => debounce(cancelReverse, 5000), [cancelReverse]);

  useEffect(() => {
    return roomService.subscribe('COMMAND_EXECUTED', (command) => {
      if (command instanceof ReverseDirectionMazeBattleCommandModel) {
        const characterName = gameState.getCharacterName(command.getCharacterId());

        const targetCharacterId = command.getTargetCharacterId();
        const targetCharacterName = gameState.getCharacterName(targetCharacterId);

        notificationEventHandler.publishGeneralMessage(`${characterName} reversed ${targetCharacterName}'s direction!`);

        if (targetCharacterId === myCharacterId) {
          cancelReverseDebouncer();
        }
      } else if (command instanceof SwitchPositionMazeBattleCommandModel) {
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
        <MazeCanvas myPlayerId={myPlayerId} gameState={gameState} />
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
