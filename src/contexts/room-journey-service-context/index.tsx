import { createContext, useCallback, useRef, useState, useMemo, useEffect } from 'react';
import { RoomJourneyApi } from '@/adapters/apis/room-journey-api';
import { DirectionVo } from '@/models/game/common/direction-vo';
import { RoomJourneyService } from '@/services/room-journey-service';
import { PlayerActionVo } from '@/models/game/player/player-action-vo';
import { ChangePlayerActionCommand } from '@/services/room-journey-service/managers/command-manager/commands/change-player-action-command';
import { NotificationEventDispatcher } from '@/event-dispatchers/notification-event-dispatcher';

type ConnectionStatus = 'WAITING' | 'CONNECTING' | 'OPEN' | 'DISCONNECTED';

type ContextValue = {
  roomJourneyService: RoomJourneyService | null;
  connectionStatus: ConnectionStatus;
  enterRoom: (roomId: string) => void;
  updateCameraPosition: () => void;
  makePlayerStand: () => void;
  makePlayerWalk: (direction: DirectionVo) => void;
  leaveRoom: () => void;
};

const Context = createContext<ContextValue>({
  roomJourneyService: null,
  connectionStatus: 'WAITING',
  enterRoom: () => {},
  updateCameraPosition: () => {},
  makePlayerStand: () => {},
  makePlayerWalk: () => {},
  leaveRoom: () => {},
});

type Props = {
  children: React.ReactNode;
};

export function Provider({ children }: Props) {
  const [roomJourneyService, setRoomJourneyService] = useState<RoomJourneyService | null>(null);
  useEffect(() => {
    // @ts-expect-error
    window.roomJourneyService = roomJourneyService;
  }, [roomJourneyService]);

  const notificationEventDispatcher = useMemo(() => NotificationEventDispatcher.create(), []);

  const roomJourneyApi = useRef<RoomJourneyApi | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('WAITING');

  useEffect(() => {
    return () => {
      roomJourneyService?.destroy();
    };
  }, [roomJourneyService]);

  const leaveRoom = useCallback(() => {
    roomJourneyApi.current?.disconnect();
    roomJourneyApi.current = null;
    setRoomJourneyService(null);
    setConnectionStatus('WAITING');
  }, []);

  const enterRoom = useCallback((roomId: string) => {
    if (roomJourneyApi.current) {
      leaveRoom();
      return;
    }

    let newRoomJourneyService: RoomJourneyService | null = null;
    const newRoomJourneyApi = RoomJourneyApi.create(roomId, {
      onRoomEntered: (_roomJourneyService) => {
        newRoomJourneyService = _roomJourneyService;
        setRoomJourneyService(_roomJourneyService);
      },
      onCommandReceived: (command) => {
        if (!newRoomJourneyService) return;
        newRoomJourneyService.executeRemoteCommand(command);
      },
      onCommandFailed: (commandId) => {
        if (!newRoomJourneyService) return;
        newRoomJourneyService.removeFailedCommand(commandId);
      },
      onErrored: (message) => {
        notificationEventDispatcher.publishErrorTriggeredEvent(message);
      },
      onOpen: () => {
        setConnectionStatus('OPEN');
      },
      onDisconnect: () => {
        roomJourneyApi.current = null;
        setRoomJourneyService(null);
        setConnectionStatus('DISCONNECTED');
      },
    });
    setConnectionStatus('CONNECTING');
    roomJourneyApi.current = newRoomJourneyApi;
  }, []);

  useEffect(() => {
    if (!roomJourneyService) return () => {};

    return roomJourneyService.subscribe('LOCAL_COMMAND_EXECUTED', (command) => {
      if (!roomJourneyApi.current) return;

      roomJourneyApi.current.sendCommand(command);
    });
  }, [roomJourneyService]);

  const updateCameraPosition = useCallback(() => {
    if (!roomJourneyService) return;

    roomJourneyService.updateCameraPosition();
  }, [roomJourneyService]);

  const makePlayerStand = useCallback(() => {
    if (!roomJourneyApi.current || !roomJourneyService) {
      return;
    }

    const myPlayer = roomJourneyService.getMyPlayer();
    if (myPlayer.getAction().isStand()) return;

    const playerDirection = roomJourneyService.getMyPlayer().getDirection();
    const playerAction = PlayerActionVo.newStand(playerDirection);
    const command = ChangePlayerActionCommand.create(myPlayer.getId(), playerAction);
    roomJourneyService.executeLocalCommand(command);
  }, [roomJourneyService]);

  const makePlayerWalk = useCallback(
    (direction: DirectionVo) => {
      if (!roomJourneyApi.current || !roomJourneyService) {
        return;
      }

      const myPlayer = roomJourneyService.getMyPlayer();
      const playerAction = PlayerActionVo.newWalk(direction);
      const command = ChangePlayerActionCommand.create(myPlayer.getId(), playerAction);
      roomJourneyService.executeLocalCommand(command);
    },
    [roomJourneyService]
  );

  const context = {
    roomJourneyService,
    connectionStatus,
    enterRoom,
    updateCameraPosition,
    makePlayerStand,
    makePlayerWalk,
    leaveRoom,
  };

  return <Context.Provider value={useMemo<ContextValue>(() => context, Object.values(context))}>{children}</Context.Provider>;
}

export { Provider as RoomJourneyServiceProvider, Context as RoomJourneyServiceContext };
