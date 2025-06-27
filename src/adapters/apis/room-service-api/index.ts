import { RoomModel } from '@/models/room/room-model';
import { PlayerModel } from '@/models/player/player-model';
import { AuthSessionStorage } from '@/adapters/storages/auth-session-storage';
import { RoomService } from '@/services/room-service';
import { ServerEvent, ServerEventNameEnum, RoomJoinedServerEvent } from './server-events';
import { parseRoomDto } from '../dtos/room-dto';
import { parsePlayerDto } from '../dtos/player-dto';
import {
  ClientEvent,
  ClientEventNameEnum,
  CommandExecutedClientEvent,
  CommandSentClientEvent,
  P2pAnswerSentClientEvent,
  P2pConnectedClientEvent,
  P2pOfferSentClientEvent,
  PingClientEvent,
  SetupNewGameRequestedClientEvent,
  StartGameRequestedClientEvent,
} from './client-events';
import { P2pConnection, createP2pConnection } from './p2p-connection';
import { CommandSentP2pEvent, MessageSentP2pEvent, P2pEvent, P2pEventNameEnum } from './p2p-events';
import { parseGameDto } from '../dtos/game-dto';
import { GameModel } from '@/models/game/game-model';
import { CommandModel } from '@/models/game/command-model';
import { CommandDto, parseCommandDto } from '../dtos/command-dto';
import { MessageModel } from '@/models/message/message-model';
import { generateMessageDto, MessageDto, parseMessageDto } from '../dtos/message-dto';

function parseRoomJoinedServerEvent(event: RoomJoinedServerEvent): [RoomModel, GameModel, CommandModel[], string, PlayerModel[]] {
  return [
    parseRoomDto(event.room),
    parseGameDto(event.game),
    event.commands.map(parseCommandDto),
    event.myPlayerId,
    event.players.map(parsePlayerDto),
  ];
}

export class RoomServiceApi {
  private socket: WebSocket;

  private disconnectedByUser: boolean = false;

  private p2pConnectionMap = new Map<string, P2pConnection>();

  private roomService: RoomService | null = null;

  constructor(
    roomId: string,
    events: {
      onRoomJoined: (roomService: RoomService) => void;
      onGameStarted: (game: GameModel) => void;
      onNewGameSetup: (game: GameModel) => void;
      onPlayerJoined: (player: PlayerModel) => void;
      onPlayerLeft: (playerId: string) => void;
      onCommandReceived: (command: CommandModel) => void;
      onCommandFailed: (commandId: string) => void;
      onMessageReceived: (message: MessageModel) => void;
      onErrored: (message: string) => void;
      onDisconnect: () => void;
      onOpen: () => void;
    }
  ) {
    const authSessionStorage = AuthSessionStorage.get();
    const accessToken = authSessionStorage.getAccessToken();

    const socketUrl = `${process.env.API_SOCKET_URL}/api/room-service/?id=${roomId}&access-token=${accessToken}`;
    const socket = new WebSocket(socketUrl, []);

    let pingServerInterval: NodeJS.Timer | null = null;

    const handleP2pMessage = (p2pEvent: P2pEvent) => {
      if (p2pEvent.name === P2pEventNameEnum.CommandSent) {
        const command = parseCommandDto(p2pEvent.command);
        if (!command) return;
        events.onCommandReceived(command);
      } else if (p2pEvent.name === P2pEventNameEnum.MessageSent) {
        const message = parseMessageDto(p2pEvent.message);
        if (!message) return;
        events.onMessageReceived(message);
      }
    };
    const handleP2pClose = (peerPlayerId: string) => {
      this.p2pConnectionMap.delete(peerPlayerId);
    };

    socket.onmessage = async ({ data }: any) => {
      const eventJsonString: string = await data.text();
      const event: ServerEvent = JSON.parse(eventJsonString);

      console.log('server event received: ', event.name, event);
      if (event.name === ServerEventNameEnum.RoomJoined) {
        const [room, game, commands, myPlayerId, players] = parseRoomJoinedServerEvent(event);
        const roomService = RoomService.create(room, game, commands, players, myPlayerId);
        events.onRoomJoined(roomService);
        this.roomService = roomService;
      } else if (event.name === ServerEventNameEnum.GameStarted) {
        if (!this.roomService) return;

        events.onGameStarted(parseGameDto(event.game));
      } else if (event.name === ServerEventNameEnum.NewGameSetup) {
        if (!this.roomService) return;

        events.onNewGameSetup(parseGameDto(event.game));
      } else if (event.name === ServerEventNameEnum.PlayerJoined) {
        if (!this.roomService) return;

        events.onPlayerJoined(parsePlayerDto(event.player));

        const newP2pConnection = createP2pConnection({
          onMessage: handleP2pMessage,
          onOpen: () => {
            const clientEvent: P2pConnectedClientEvent = {
              name: ClientEventNameEnum.P2pConnected,
              peerPlayerId: event.player.id,
            };
            this.sendClientEvent(clientEvent);
          },
          onClose: () => {
            handleP2pClose(event.player.id);
          },
        });
        const [offer, iceCandidates] = await newP2pConnection.createOffer();
        if (!offer || iceCandidates.length === 0) return;

        this.p2pConnectionMap.set(event.player.id, newP2pConnection);

        const clientEvent: P2pOfferSentClientEvent = {
          name: ClientEventNameEnum.P2pOfferSent,
          peerPlayerId: event.player.id,
          iceCandidates,
          offer,
        };

        this.sendClientEvent(clientEvent);
      } else if (event.name === ServerEventNameEnum.P2pOfferReceived) {
        const newP2pConnection = createP2pConnection({
          onMessage: handleP2pMessage,
          onOpen: () => {
            const clientEvent: P2pConnectedClientEvent = {
              name: ClientEventNameEnum.P2pConnected,
              peerPlayerId: event.peerPlayerId,
            };
            this.sendClientEvent(clientEvent);
          },
          onClose: () => {
            handleP2pClose(event.peerPlayerId);
          },
        });
        const [answer, iceCandidates] = await newP2pConnection.createAnswer(event.offer, event.iceCandidates);
        if (!answer || iceCandidates.length === 0) return;

        this.p2pConnectionMap.set(event.peerPlayerId, newP2pConnection);

        const clientEvent: P2pAnswerSentClientEvent = {
          name: ClientEventNameEnum.P2pAnswerSent,
          peerPlayerId: event.peerPlayerId,
          iceCandidates,
          answer,
        };

        this.sendClientEvent(clientEvent);
      } else if (event.name === ServerEventNameEnum.P2pAnswerReceived) {
        const p2pConnection = this.p2pConnectionMap.get(event.peerPlayerId);
        if (!p2pConnection) return;

        p2pConnection.acceptAnswer(event.answer, event.iceCandidates);
      } else if (event.name === ServerEventNameEnum.PlayerLeft) {
        if (!this.roomService) return;

        events.onPlayerLeft(event.playerId);
      } else if (event.name === ServerEventNameEnum.CommandReceived) {
        const command = parseCommandDto(event.command);
        if (!command) return;
        events.onCommandReceived(command);
      } else if (event.name === ServerEventNameEnum.CommandFailed) {
        events.onCommandFailed(event.commandId);
      } else if (event.name === ServerEventNameEnum.Errored) {
        events.onErrored(event.message);
      }
    };

    socket.onclose = () => {
      if (pingServerInterval) {
        clearInterval(pingServerInterval);
      }
      if (!this.disconnectedByUser) {
        events.onDisconnect();
      }
    };

    socket.onopen = () => {
      pingServerInterval = setInterval(() => {
        this.ping();
      }, 10000);
      events.onOpen();
    };

    this.socket = socket;

    // @ts-expect-error
    window.sendCommand = this.sendCommand.bind(this);
  }

  static create(
    roomId: string,
    events: {
      onRoomJoined: (roomService: RoomService) => void;
      onGameStarted: (game: GameModel) => void;
      onNewGameSetup: (game: GameModel) => void;
      onPlayerJoined: (player: PlayerModel) => void;
      onPlayerLeft: (playerId: string) => void;
      onCommandReceived: (command: CommandModel) => void;
      onCommandFailed: (commandId: string) => void;
      onMessageReceived: (message: MessageModel) => void;
      onErrored: (message: string) => void;
      onDisconnect: () => void;
      onOpen: () => void;
    }
  ): RoomServiceApi {
    return new RoomServiceApi(roomId, events);
  }

  public disconnect() {
    this.disconnectedByUser = true;
    this.socket.close();
  }

  private async sendClientEvent(clientEvent: ClientEvent) {
    console.log('client event sent: ', clientEvent.name, clientEvent);

    const jsonString = JSON.stringify(clientEvent);
    const jsonBlob = new Blob([jsonString]);

    if (this.socket.readyState !== this.socket.OPEN) {
      return;
    }
    this.socket.send(jsonBlob);
  }

  public startGame(gameId: string, gameState: object) {
    const clientEvent: StartGameRequestedClientEvent = {
      name: ClientEventNameEnum.StartGameRequested,
      gameId,
      gameState,
    };
    this.sendClientEvent(clientEvent);
  }

  public setupNewGame(gameName: string) {
    const clientEvent: SetupNewGameRequestedClientEvent = {
      name: ClientEventNameEnum.SetupNewGameRequested,
      gameName,
    };
    this.sendClientEvent(clientEvent);
  }

  public ping() {
    const clientEvent: PingClientEvent = {
      name: ClientEventNameEnum.Ping,
    };
    this.sendClientEvent(clientEvent);
  }

  public sendMessage(message: MessageModel) {
    if (!this.roomService) return;

    const messageDto: MessageDto = generateMessageDto(message);
    if (!messageDto) return;

    this.roomService.getOtherPlayers().forEach((otherPlayer) => {
      const otherPlayerId = otherPlayer.getId();
      const p2pConnection = this.p2pConnectionMap.get(otherPlayerId);

      if (p2pConnection) {
        const p2pEvent: MessageSentP2pEvent = {
          name: P2pEventNameEnum.MessageSent,
          message: messageDto,
        };
        p2pConnection.sendMessage(p2pEvent);
      }
    });
  }

  public sendCommand(command: CommandModel) {
    if (!this.roomService) return;

    const commandDto: CommandDto = command.toJson();
    if (!commandDto) return;

    // Send command to server for saving the command
    const clientEvent: CommandExecutedClientEvent = {
      name: ClientEventNameEnum.CommandExecuted,
      command: commandDto,
    };
    this.sendClientEvent(clientEvent);

    this.roomService.getOtherPlayers().forEach((otherPlayer) => {
      const otherPlayerId = otherPlayer.getId();
      const p2pConnection = this.p2pConnectionMap.get(otherPlayerId);

      const commandSentClientEvent: CommandSentClientEvent = {
        name: ClientEventNameEnum.CommandSent,
        peerPlayerId: otherPlayerId,
        command: commandDto,
      };

      if (p2pConnection && p2pConnection.getIsConnected()) {
        const p2pEvent: CommandSentP2pEvent = {
          name: P2pEventNameEnum.CommandSent,
          command: commandDto,
        };

        const succeeded = p2pConnection.sendMessage(p2pEvent);
        if (!succeeded) {
          this.sendClientEvent(commandSentClientEvent);
        }
      } else {
        this.sendClientEvent(commandSentClientEvent);
      }
    });
  }
}
