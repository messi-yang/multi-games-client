import { CommandJson } from '@/models/game/command-json';
import { CommandModel } from '@/models/game/command-model';
import { MazeBattleGameMoveCommand, MazeBattleGameMoveCommandPayload } from './move-commands';
import { DateVo } from '@/models/global/date-vo';
import { MazeBattleGameStateVo } from '../game-state-vo';
import { MazeBattleGameCommandNameEnum } from '../game-command-name-enum';

export function parseMazeBattleGameCommandJson(json: CommandJson): CommandModel<MazeBattleGameStateVo> {
  if (json.name === MazeBattleGameCommandNameEnum.Move) {
    const payload = json.payload as MazeBattleGameMoveCommandPayload;
    return MazeBattleGameMoveCommand.load({
      id: json.id,
      gameId: json.gameId,
      playerId: json.playerId,
      executedAt: DateVo.fromTimestamp(json.timestamp),
      direction: payload.direction,
    });
  }

  throw new Error(`Unknown command name: ${json.name}`);
}
