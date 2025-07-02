import { CommandJson } from '@/models/game/command-json';
import { CommandModel } from '@/models/game/command-model';
import { MazeBattleGameMoveCommand, MazeBattleGameMoveCommandPayload } from './move-commands';
import { DateVo } from '@/models/global/date-vo';
import { MazeBattleGameStateVo } from '../game-state-vo';
import { MazeBattleGameCommandNameEnum } from '../game-command-name-enum';
import { MazeBattleGameSwitchPositionCommand, MazeBattleGameSwitchPositionCommandPayload } from './switch-position-command';
import { MazeBattleGameReverseDirectionCommand, MazeBattleGameReverseDirectionCommandPayload } from './reverse-direction-command';

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
  } else if (json.name === MazeBattleGameCommandNameEnum.SwitchPosition) {
    const payload = json.payload as MazeBattleGameSwitchPositionCommandPayload;
    return MazeBattleGameSwitchPositionCommand.load({
      id: json.id,
      gameId: json.gameId,
      playerId: json.playerId,
      executedAt: DateVo.fromTimestamp(json.timestamp),
      characterId: payload.characterId,
      itemIndex: payload.itemIndex,
      targetCharacterId: payload.targetCharacterId,
    });
  } else if (json.name === MazeBattleGameCommandNameEnum.ReverseDirection) {
    const payload = json.payload as MazeBattleGameReverseDirectionCommandPayload;
    return MazeBattleGameReverseDirectionCommand.load({
      id: json.id,
      gameId: json.gameId,
      playerId: json.playerId,
      executedAt: DateVo.fromTimestamp(json.timestamp),
      characterId: payload.characterId,
      itemIndex: payload.itemIndex,
      targetCharacterId: payload.targetCharacterId,
    });
  }

  throw new Error(`Unknown command name: ${json.name}`);
}
