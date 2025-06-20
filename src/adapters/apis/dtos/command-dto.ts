import { CommandModel } from '@/models/game/command-model';
import { parseHelloWorldGameCommandJson } from '@/models/game/games/hello-world/commands/utils';

export type CommandDto = {
  id: string;
  gameId: string;
  playerId: string;
  timestamp: number;
  name: string;
  payload: object;
};

export function parseCommandDto(dto: CommandDto): CommandModel<object> {
  if (dto.name === 'say_hello') {
    return parseHelloWorldGameCommandJson(dto);
  }

  throw new Error(`Unknown command name: ${dto.name}`);
}
