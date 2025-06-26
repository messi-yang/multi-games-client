import { createContext, useCallback, useRef, useState, useMemo, useEffect } from 'react';
import { RoomServiceApi } from '@/adapters/apis/room-service-api';
import { RoomService } from '@/services/room-service';
import { NotificationEventDispatcher } from '@/event-dispatchers/notification-event-dispatcher';
import { PlayerModel } from '@/models/player/player-model';
import { GameModel } from '@/models/game/game-model';
import { GameStateVo } from '@/models/game/game-state-vo';

type ConnectionStatus = 'WAITING' | 'CONNECTING' | 'OPEN' | 'DISCONNECTED';

type ContextValue = {
  roomService: RoomService | null;
  connectionStatus: ConnectionStatus;
  currentGame: GameModel | null;
  currentGameState: GameStateVo | null;
  myPlayerId: string | null;
  hostPlayerId: string | null;
  players: PlayerModel[];
  joinRoom: (roomId: string) => void;
  startGame: () => void;
  setupNewGame: (gameName: string) => void;
  leaveRoom: () => void;
};

const Context = createContext<ContextValue>({
  roomService: null,
  connectionStatus: 'WAITING',
  currentGame: null,
  currentGameState: null,
  myPlayerId: null,
  hostPlayerId: null,
  players: [],
  joinRoom: () => {},
  startGame: () => {},
  setupNewGame: () => {},
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
  const [currentGame, setCurrentGame] = useState<GameModel | null>(null);
  useEffect(() => {
    if (!roomService) return () => {};
    return roomService.subscribe('CURRENT_GAME_UPDATED', (newGame) => {
      setCurrentGame(newGame);
    });
  }, [roomService]);

  const [currentGameState, setCurrentGameState] = useState<GameStateVo | null>(null);
  useEffect(() => {
    if (!currentGame) {
      setCurrentGameState(null);
    } else {
      setCurrentGameState(currentGame.getState());
    }
  }, [currentGame]);

  useEffect(() => {
    if (!roomService) return () => {};
    return roomService.subscribe('NEW_GAME_SETUP', (newGame) => {
      setCurrentGame(newGame);
    });
  }, [roomService]);
  const [players, setPlayers] = useState<PlayerModel[]>([]);
  useEffect(() => {
    if (!roomService) return () => {};
    return roomService.subscribe('PLAYERS_UPDATED', (newPlayers) => {
      setPlayers(newPlayers);
    });
  }, [roomService]);

  const leaveRoom = useCallback(() => {
    roomApi.current?.disconnect();
    roomApi.current = null;
    setRoomService(null);
    setConnectionStatus('WAITING');
  }, []);

  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  useEffect(() => {
    if (!roomService) return () => {};
    return roomService.subscribe('MY_PLAYER_ID_UPDATED', (newMyPlayerId) => {
      setMyPlayerId(newMyPlayerId);
    });
  }, [roomService]);

  const [hostPlayerId, setHostPlayerId] = useState<string | null>(null);

  useEffect(() => {
    if (!roomService) return () => {};
    return roomService.subscribe('HOST_PLAYER_ID_UPDATED', (newHostPlayerId) => {
      setHostPlayerId(newHostPlayerId);
    });
  }, [roomService]);

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
      },
      onGameStarted: (game) => {
        if (!newRoomService) return;
        newRoomService.startGame(game);
      },
      onNewGameSetup: (game) => {
        if (!newRoomService) return;
        newRoomService.setupNewGame(game);
      },
      onPlayerJoined: (player) => {
        if (!newRoomService) return;
        newRoomService.addPlayer(player);
      },
      onPlayerLeft: (playerId) => {
        if (!newRoomService) return;
        newRoomService.removePlayer(playerId);
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

  const startGame = useCallback(() => {
    if (!roomApi.current || !roomService || !currentGame) return;

    roomApi.current.startGame(currentGame.getId(), currentGame.generateInitialState(players).toJson());
  }, [roomService, players, currentGame, roomApi]);

  const setupNewGame = useCallback(
    (gameName: string) => {
      if (!roomApi.current || !roomService || !currentGame) return;
      roomApi.current.setupNewGame(gameName);
    },
    [roomService, currentGame, roomApi]
  );

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
    currentGame,
    currentGameState,
    myPlayerId,
    hostPlayerId,
    players,
    joinRoom,
    startGame,
    setupNewGame,
    leaveRoom,
  };

  return <Context.Provider value={useMemo<ContextValue>(() => context, Object.values(context))}>{children}</Context.Provider>;
}

export { Provider as RoomServiceProvider, Context as RoomServiceContext };
