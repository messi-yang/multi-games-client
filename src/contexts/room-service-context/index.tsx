import { createContext, useCallback, useRef, useState, useMemo, useEffect } from 'react';
import { RoomServiceApi } from '@/adapters/apis/room-service-api';
import { RoomService } from '@/services/room-service';
import { NotificationEventDispatcher } from '@/event-dispatchers/notification-event-dispatcher';
import { PlayerModel } from '@/models/player/player-model';
import { GameModel } from '@/models/game/game-model';

type ConnectionStatus = 'WAITING' | 'CONNECTING' | 'OPEN' | 'DISCONNECTED';

type ContextValue = {
  roomService: RoomService | null;
  connectionStatus: ConnectionStatus;
  game: GameModel<object> | null;
  players: PlayerModel[];
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
};

const Context = createContext<ContextValue>({
  roomService: null,
  connectionStatus: 'WAITING',
  game: null,
  players: [],
  joinRoom: () => {},
  leaveRoom: () => {},
});

type Props = {
  children: React.ReactNode;
};

export function Provider({ children }: Props) {
  const [roomService, setRoomService] = useState<RoomService | null>(null);
  useEffect(() => {
    // @ts-expect-error
    window.roomService = roomService;
  }, [roomService]);

  const notificationEventDispatcher = useMemo(() => NotificationEventDispatcher.create(), []);

  const roomApi = useRef<RoomServiceApi | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('WAITING');
  const [game, setGame] = useState<GameModel<object> | null>(null);
  useEffect(() => {
    if (!roomService) return () => {};
    return roomService.subscribe('GAME_UPDATED', (newGame) => {
      setGame(newGame);
    });
  }, [roomService]);

  const [players, setPlayers] = useState<PlayerModel[]>([]);
  // useEffect(() => {
  //   if (!roomService) return () => {};
  //   return roomService.subscribe('PLAYERS_UPDATED', (newPlayers) => {
  //     setPlayers(newPlayers);
  //   });
  // }, [roomService]);

  const leaveRoom = useCallback(() => {
    roomApi.current?.disconnect();
    roomApi.current = null;
    setRoomService(null);
    setConnectionStatus('WAITING');
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    if (roomApi.current) {
      leaveRoom();
      return;
    }

    let newRoomService: RoomService | null = null;
    const newRoomServiceApi = RoomServiceApi.create(roomId, {
      onRoomJoined: (_roomService) => {
        newRoomService = _roomService;
        setRoomService(_roomService);
        setPlayers(_roomService.getPlayers());
        setGame(_roomService.getCurrentGame());
      },
      onPlayerJoined: (player) => {
        if (!newRoomService) return;
        setPlayers((prevPlayers) => [...prevPlayers, player]);
      },
      onPlayerLeft: (playerId) => {
        if (!newRoomService) return;
        setPlayers((prevPlayers) => prevPlayers.filter((player) => player.getId() !== playerId));
      },
      onCommandReceived: (command) => {
        if (!newRoomService) return;
        newRoomService.executeRemoteCommand(command);
      },
      onCommandFailed: (commandId) => {
        if (!newRoomService) return;
        newRoomService.removeFailedCommand(commandId);
      },
      onErrored: (message) => {
        notificationEventDispatcher.publishErrorTriggeredEvent(message);
      },
      onOpen: () => {
        setConnectionStatus('OPEN');
      },
      onDisconnect: () => {
        roomApi.current = null;
        setRoomService(null);
        setConnectionStatus('DISCONNECTED');
      },
    });
    setConnectionStatus('CONNECTING');
    roomApi.current = newRoomServiceApi;
  }, []);

  useEffect(() => {
    if (!roomService) return () => {};

    return roomService.subscribe('LOCAL_COMMAND_EXECUTED', (command) => {
      if (!roomApi.current) return;

      roomApi.current.sendCommand(command);
    });
  }, [roomService]);

  const context = {
    roomService,
    connectionStatus,
    game,
    players,
    joinRoom,
    leaveRoom,
  };

  return <Context.Provider value={useMemo<ContextValue>(() => context, Object.values(context))}>{children}</Context.Provider>;
}

export { Provider as RoomServiceProvider, Context as RoomServiceContext };
