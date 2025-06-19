import { parseCommandDto, toCommandDto } from './command-dtos';
import { RoomModel } from '@/models/game/room/room-model';
import { PlayerModel } from '@/models/game/player/player-model';
import { AuthSessionStorage } from '@/adapters/storages/auth-session-storage';
import { RoomJourneyService } from '@/services/room-journey-service';
import { ServerEvent, ServerEventNameEnum, RoomEnteredServerEvent } from './server-events';
import { Command } from '@/services/room-journey-service/managers/command-manager/command';
import { parseRoomDto } from '../dtos/room-dto';
import { parsePlayerDto } from '../dtos/player-dto';
import {
  ClientEvent,
  ClientEventNameEnum,
  CommandExecutedClientEvent,
  CommandSentClientEvent,
  P2pAnswerSentClientEvent,
  P2pOfferSentClientEvent,
  PingClientEvent,
} from './client-events';
import { P2pConnection, createP2pConnection } from './p2p-connection';
import { CommandSentP2pEvent, P2pEvent, P2pEventNameEnum } from './p2p-events';
import { AddPlayerCommand } from '@/services/room-journey-service/managers/command-manager/commands/add-player-command';
import { RemovePlayerCommand } from '@/services/room-journey-service/managers/command-manager/commands/remove-player-command';
import { generateUuidV4 } from '@/utils/uuid';
import { DateVo } from '@/models/global/date-vo';

function parseRoomEnteredServerEvent(event: RoomEnteredServerEvent): [RoomModel, string, PlayerModel[]] {
  return [parseRoomDto(event.room), event.myPlayerId, event.players.map(parsePlayerDto)];
}

export class RoomJourneyApi {
  private socket: WebSocket;

  private disconnectedByUser: boolean = false;

  private p2pConnectionMap = new Map<string, P2pConnection>();

  private roomJourneyService: RoomJourneyService | null = null;

  constructor(
    roomId: string,
    events: {
      onRoomEntered: (roomJourneyService: RoomJourneyService) => void;
      onCommandReceived: (command: Command) => void;
      onCommandFailed: (commandId: string) => void;
      onErrored: (message: string) => void;
      onDisconnect: () => void;
      onOpen: () => void;
    }
  ) {
    const authSessionStorage = AuthSessionStorage.get();
    const accessToken = authSessionStorage.getAccessToken();

    const socketUrl = `${process.env.API_SOCKET_URL}/api/room-journey/?id=${roomId}&access-token=${accessToken}`;
    const socket = new WebSocket(socketUrl, []);

    let pingServerInterval: NodeJS.Timer | null = null;

    const handleP2pMessage = (p2pEvent: P2pEvent) => {
      if (p2pEvent.name === P2pEventNameEnum.CommandSent) {
        const command = parseCommandDto(p2pEvent.command);
        if (!command) return;
        events.onCommandReceived(command);
      }
    };
    const handleP2pClose = (peerPlayerId: string) => {
      this.p2pConnectionMap.delete(peerPlayerId);
    };

    socket.onmessage = async ({ data }: any) => {
      const eventJsonString: string = await data.text();
      const event: ServerEvent = JSON.parse(eventJsonString);
      console.log('event', event);

      // console.log(event.name, event);
      if (event.name === ServerEventNameEnum.RoomEntered) {
        const [room, myPlayerId, players] = parseRoomEnteredServerEvent(event);
        const roomJourneyService = RoomJourneyService.create(room, players, myPlayerId);
        events.onRoomEntered(roomJourneyService);
        this.roomJourneyService = roomJourneyService;
      } else if (event.name === ServerEventNameEnum.PlayerJoined) {
        if (!this.roomJourneyService) return;

        this.roomJourneyService.executeRemoteCommand(
          AddPlayerCommand.createRemote(generateUuidV4(), DateVo.now(), parsePlayerDto(event.player))
        );

        const newP2pConnection = createP2pConnection({
          onMessage: handleP2pMessage,
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

        this.sendMessage(clientEvent);
      } else if (event.name === ServerEventNameEnum.P2pOfferReceived) {
        const newP2pConnection = createP2pConnection({
          onMessage: handleP2pMessage,
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

        this.sendMessage(clientEvent);
      } else if (event.name === ServerEventNameEnum.P2pAnswerReceived) {
        const p2pConnection = this.p2pConnectionMap.get(event.peerPlayerId);
        if (!p2pConnection) return;

        p2pConnection.acceptAnswer(event.answer, event.iceCandidates);
      } else if (event.name === ServerEventNameEnum.PlayerLeft) {
        if (!this.roomJourneyService) return;

        this.roomJourneyService.executeRemoteCommand(RemovePlayerCommand.createRemote(generateUuidV4(), DateVo.now(), event.playerId));
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
      onRoomEntered: (roomJourneyService: RoomJourneyService) => void;
      onCommandReceived: (command: Command) => void;
      onCommandFailed: (commandId: string) => void;
      onErrored: (message: string) => void;
      onDisconnect: () => void;
      onOpen: () => void;
    }
  ): RoomJourneyApi {
    return new RoomJourneyApi(roomId, events);
  }

  public disconnect() {
    this.disconnectedByUser = true;
    this.socket.close();
  }

  private async sendMessage(clientEvent: ClientEvent) {
    const jsonString = JSON.stringify(clientEvent);
    const jsonBlob = new Blob([jsonString]);

    if (this.socket.readyState !== this.socket.OPEN) {
      return;
    }
    // console.log('Send via Websocket', clientEvent.name, clientEvent);
    this.socket.send(jsonBlob);
  }

  public ping() {
    const clientEvent: PingClientEvent = {
      name: ClientEventNameEnum.Ping,
    };
    this.sendMessage(clientEvent);
  }

  public sendCommand(command: Command) {
    if (!this.roomJourneyService) return;

    const commandDto = toCommandDto(command);
    if (!commandDto) return;

    console.log('sendCommand', commandDto);

    const isClientOnly = command.getIsClientOnly();

    if (!isClientOnly) {
      const clientEvent: CommandExecutedClientEvent = {
        name: ClientEventNameEnum.CommandExecuted,
        command: commandDto,
      };
      this.sendMessage(clientEvent);
    }

    this.roomJourneyService.getOtherPlayers().forEach((otherPlayer) => {
      const otherPlayerId = otherPlayer.getId();
      const p2pConnection = this.p2pConnectionMap.get(otherPlayerId);

      const commandSentClientEvent: CommandSentClientEvent = {
        name: ClientEventNameEnum.CommandSent,
        peerPlayerId: otherPlayerId,
        command: commandDto,
      };

      if (!p2pConnection) {
        this.sendMessage(commandSentClientEvent);
        return;
      }

      const p2pEvent: CommandSentP2pEvent = {
        name: P2pEventNameEnum.CommandSent,
        command: commandDto,
      };
      const succeeded = p2pConnection.sendMessage(p2pEvent);
      if (!succeeded) {
        this.sendMessage(commandSentClientEvent);
      }
    });
  }
}
