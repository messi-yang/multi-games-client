import { CommandDto } from '../dtos/command-dto';
import { MessageDto } from '../dtos/message-dto';

export enum P2pEventNameEnum {
  CommandSent = 'COMMAND_SENT',
  MessageSent = 'MESSAGE_SENT',
}

export type CommandSentP2pEvent = {
  name: P2pEventNameEnum.CommandSent;
  command: CommandDto;
};

export type MessageSentP2pEvent = {
  name: P2pEventNameEnum.MessageSent;
  message: MessageDto;
};

export type P2pEvent = CommandSentP2pEvent | MessageSentP2pEvent;
