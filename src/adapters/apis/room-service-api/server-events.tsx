import { GameDto } from '../dtos/game-dto';
import { PlayerDto } from '../dtos/player-dto';
import { RoomDto } from '../dtos/room-dto';
import { CommandDto } from '../dtos/command-dto';

export enum ServerEventNameEnum {
  RoomJoined = 'ROOM_JOINED',
  GameStarted = 'GAME_STARTED',
  NewGameSetup = 'NEW_GAME_SETUP',
  PlayerJoined = 'PLAYER_JOINED',
  PlayerLeft = 'PLAYER_LEFT',
  CommandReceived = 'COMMAND_RECEIVED',
  CommandFailed = 'COMMAND_FAILED',
  P2pOfferReceived = 'P2P_OFFER_RECEIVED',
  P2pAnswerReceived = 'P2P_ANSWER_RECEIVED',
  Errored = 'ERRORED',
}

export type RoomJoinedServerEvent = {
  name: ServerEventNameEnum.RoomJoined;
  game: GameDto;
  commands: CommandDto[];
  room: RoomDto;
  myPlayerId: string;
  players: PlayerDto[];
};

export type GameStartedServerEvent = {
  name: ServerEventNameEnum.GameStarted;
  game: GameDto;
};

export type NewGameSetupServerEvent = {
  name: ServerEventNameEnum.NewGameSetup;
  game: GameDto;
};

export type PlayerJoinedServerEvent = {
  name: ServerEventNameEnum.PlayerJoined;
  player: PlayerDto;
};

export type PlayerLeftServerEvent = {
  name: ServerEventNameEnum.PlayerLeft;
  playerId: string;
};

export type CommandReceivedServerEvent = {
  name: ServerEventNameEnum.CommandReceived;
  command: CommandDto;
};

export type CommandFailedServerEvent = {
  name: ServerEventNameEnum.CommandFailed;
  commandId: string;
};

export type P2pOfferReceivedServerEvent = {
  name: ServerEventNameEnum.P2pOfferReceived;
  peerPlayerId: string;
  iceCandidates: RTCIceCandidate[];
  offer: RTCSessionDescription;
};

export type P2pAnswerReceivedServerEvent = {
  name: ServerEventNameEnum.P2pAnswerReceived;
  peerPlayerId: string;
  iceCandidates: RTCIceCandidate[];
  answer: RTCSessionDescription;
};

export type ErroredServerEvent = {
  name: ServerEventNameEnum.Errored;
  message: string;
};

export type ServerEvent =
  | RoomJoinedServerEvent
  | GameStartedServerEvent
  | NewGameSetupServerEvent
  | PlayerJoinedServerEvent
  | PlayerLeftServerEvent
  | CommandReceivedServerEvent
  | CommandFailedServerEvent
  | P2pOfferReceivedServerEvent
  | P2pAnswerReceivedServerEvent
  | ErroredServerEvent;
