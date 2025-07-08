import { createContext, useCallback, useRef, useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { RoomServiceApi } from '@/adapters/apis/room-service-api';
import { RoomService } from '@/services/room-service';
import { PlayerModel } from '@/models/player/player-model';
import { GameModel } from '@/models/game/game-model';
import { GameStateModel } from '@/models/game/game-state-model';
import { MessageModel } from '@/models/message/message-model';
import { EventHandler } from '@/event-dispatchers/common/event-handler';
import { NotificationEventHandler } from '@/event-dispatchers/notification-event-handler';

type ConnectionStatus = 'WAITING' | 'CONNECTING' | 'OPEN' | 'DISCONNECTED';

type ContextValue = {
  roomService: RoomService | null;
  connectionStatus: ConnectionStatus;
  currentGame: GameModel | null;
  currentGameState: GameStateModel | null;
  myPlayerId: string | null;
  myPlayer: PlayerModel | null;
  hostPlayerId: string | null;
  players: PlayerModel[];
  messages: MessageModel[];
  joinRoom: (roomId: string, playerName: string | null) => void;
  startGame: () => void;
  setupNewGame: (gameName: string) => void;
  leaveRoom: () => void;
  sendMessage: (message: string) => void;
};

const Context = createContext<ContextValue>({
  roomService: null,
  connectionStatus: 'WAITING',
  currentGame: null,
  currentGameState: null,
  myPlayerId: null,
  myPlayer: null,
  hostPlayerId: null,
  players: [],
  messages: [],
  joinRoom: () => {},
  startGame: () => {},
  setupNewGame: () => {},
  leaveRoom: () => {},
  sendMessage: () => {},
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

  const notificationEventHandler = useMemo(() => NotificationEventHandler.create(), []);

  const gameMessageEventHandler = useMemo(() => EventHandler.create<string>(), []);
  useEffect(() => {
    return gameMessageEventHandler.subscribe((message) => {
      toast.success(message);
    });
  }, [gameMessageEventHandler]);

  const roomApi = useRef<RoomServiceApi | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('WAITING');
  const [currentGame, setCurrentGame] = useState<GameModel | null>(null);
  useEffect(() => {
    if (!roomService) return () => {};
    return roomService.subscribe('CURRENT_GAME_UPDATED', (newGame) => {
      setCurrentGame(newGame);
    });
  }, [roomService]);

  const [currentGameState, setCurrentGameState] = useState<GameStateModel | null>(null);
  useEffect(() => {
    if (!currentGame) {
      setCurrentGameState(null);
    } else {
      setCurrentGameState(currentGame.getState());
    }
  }, [currentGame]);

  const [messages, setMessages] = useState<MessageModel[]>([]);
  useEffect(() => {
    if (!roomService) return () => {};
    return roomService.subscribe('MESSAGE_ADDED', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
  }, [roomService]);

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

  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [myPlayer, setMyPlayer] = useState<PlayerModel | null>(null);
  useEffect(() => {
    if (!roomService) return () => {};
    return roomService.subscribe('MY_PLAYER_UPDATED', (newMyPlayer) => {
      setMyPlayerId(newMyPlayer.getId());
      setMyPlayer(newMyPlayer);
    });
  }, [roomService]);

  const sendMessage = useCallback(
    (message: string) => {
      if (!roomService || !myPlayer) return;

      const messageModel = MessageModel.create({
        playerName: myPlayer.getName(),
        content: message,
      });
      roomService.addLocalMessage(messageModel);
    },
    [roomService, myPlayer]
  );

  useEffect(() => {
    if (!roomService) return () => {};
    return roomService.subscribe('LOCAL_MESSAGE_ADDED', (newMessage) => {
      if (!roomApi.current) return;
      roomApi.current.sendMessage(newMessage);
    });
  }, [roomService, roomApi]);

  const [hostPlayerId, setHostPlayerId] = useState<string | null>(null);

  useEffect(() => {
    if (!roomService) return () => {};
    return roomService.subscribe('HOST_PLAYER_ID_UPDATED', (newHostPlayerId) => {
      setHostPlayerId(newHostPlayerId);
    });
  }, [roomService]);

  const joinRoom = useCallback(
    (roomId: string, playerName: string | null) => {
      let newRoomService: RoomService | null = null;
      const newRoomServiceApi = RoomServiceApi.create(roomId, playerName, {
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
        onMessageReceived: (message) => {
          if (!newRoomService) return;
          newRoomService.addRemoteMessage(message);
        },
        onErrored: (message) => {
          notificationEventHandler.publishErrorMessage(message);
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
    },
    [notificationEventHandler]
  );

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

  const leaveRoom = useCallback(() => {
    roomApi.current?.disconnect();
    roomApi.current = null;
    setRoomService(null);
    setCurrentGame(null);
    setCurrentGameState(null);
    setMessages([]);
    setPlayers([]);
    setMyPlayerId(null);
    setMyPlayer(null);
    setHostPlayerId(null);
    setConnectionStatus('WAITING');
  }, []);

  const context = {
    roomService,
    connectionStatus,
    currentGame,
    currentGameState,
    myPlayerId,
    myPlayer,
    hostPlayerId,
    players,
    messages,
    joinRoom,
    startGame,
    setupNewGame,
    leaveRoom,
    sendMessage,
  };

  return <Context.Provider value={useMemo<ContextValue>(() => context, Object.values(context))}>{children}</Context.Provider>;
}

export { Provider as RoomServiceProvider, Context as RoomServiceContext };
