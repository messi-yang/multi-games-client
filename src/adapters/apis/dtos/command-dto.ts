import { CommandModel } from '@/models/game/command-model';
import { CommandNamePrefixEnum } from '@/models/game/command-name-prefix-enum';
import { parseHelloWorldGameCommandJson } from '@/models/game/games/hello-world/commands/command-json-parser';

export type CommandDto = {
  id: string;
  gameId: string;
  playerId: string;
  timestamp: number;
  name: string;
  payload: object;
};

export function parseCommandDto(dto: CommandDto): CommandModel {
  if (dto.name.startsWith(CommandNamePrefixEnum.HelloWorld)) {
    return parseHelloWorldGameCommandJson(dto);
  }

  throw new Error(`Unknown command name: ${dto.name}`);
}
