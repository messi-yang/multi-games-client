import { CommandDto } from '../dtos/command-dto';

export enum P2pEventNameEnum {
  CommandSent = 'COMMAND_SENT',
}

export type CommandSentP2pEvent = {
  name: P2pEventNameEnum.CommandSent;
  command: CommandDto;
};

export type P2pEvent = CommandSentP2pEvent;
