import { CommandDto } from '../dtos/command-dto';

export enum ClientEventNameEnum {
  Ping = 'PING',
  StartGameRequested = 'START_GAME_REQUESTED',
  SetupNewGameRequested = 'SETUP_NEW_GAME_REQUESTED',
  CommandExecuted = 'COMMAND_EXECUTED',
  CommandSent = 'COMMAND_SENT',
  P2pOfferSent = 'P2P_OFFER_SENT',
  P2pAnswerSent = 'P2P_ANSWER_SENT',
  P2pConnected = 'P2P_CONNECTED',
}

export type PingClientEvent = {
  name: ClientEventNameEnum.Ping;
};

export type StartGameRequestedClientEvent = {
  name: ClientEventNameEnum.StartGameRequested;
  gameId: string;
  gameState: object;
};

export type SetupNewGameRequestedClientEvent = {
  name: ClientEventNameEnum.SetupNewGameRequested;
  gameName: string;
};

export type CommandExecutedClientEvent = {
  name: ClientEventNameEnum.CommandExecuted;
  command: CommandDto;
};

export type CommandSentClientEvent = {
  name: ClientEventNameEnum.CommandSent;
  peerPlayerId: string;
  command: CommandDto;
};

export type P2pOfferSentClientEvent = {
  name: ClientEventNameEnum.P2pOfferSent;
  peerPlayerId: string;
  iceCandidates: object[];
  offer: object;
};

export type P2pAnswerSentClientEvent = {
  name: ClientEventNameEnum.P2pAnswerSent;
  peerPlayerId: string;
  iceCandidates: object[];
  answer: object;
};

export type P2pConnectedClientEvent = {
  name: ClientEventNameEnum.P2pConnected;
  peerPlayerId: string;
};

export type ClientEvent =
  | PingClientEvent
  | StartGameRequestedClientEvent
  | SetupNewGameRequestedClientEvent
  | CommandExecutedClientEvent
  | CommandSentClientEvent
  | P2pOfferSentClientEvent
  | P2pAnswerSentClientEvent
  | P2pConnectedClientEvent;
