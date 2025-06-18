import { CommandDto } from './command-dtos';

export enum ClientEventNameEnum {
  Ping = 'PING',
  CommandExecuted = 'COMMAND_EXECUTED',
  CommandSent = 'COMMAND_SENT',
  P2pOfferSent = 'P2P_OFFER_SENT',
  P2pAnswerSent = 'P2P_ANSWER_SENT',
}

export type PingClientEvent = {
  name: ClientEventNameEnum.Ping;
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

export type ClientEvent =
  | PingClientEvent
  | CommandExecutedClientEvent
  | CommandSentClientEvent
  | P2pOfferSentClientEvent
  | P2pAnswerSentClientEvent;
