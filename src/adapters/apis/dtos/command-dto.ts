import { CommandModel } from '@/models/game/command-model';
import { GameNameEnum } from '@/models/game/game-name-enum';
import { parseMazeBattleGameCommandJson } from '@/models/game/games/maze-battle/commands/command-json-parser';

export type CommandDto = {
  id: string;
  gameId: string;
  playerId: string;
  timestamp: number;
  name: string;
  payload: object;
};

export function parseCommandDto(dto: CommandDto): CommandModel {
  if (dto.name.startsWith(GameNameEnum.MazeBattle)) {
    return parseMazeBattleGameCommandJson(dto);
  }

  throw new Error(`Unknown command name: ${dto.name}`);
}
