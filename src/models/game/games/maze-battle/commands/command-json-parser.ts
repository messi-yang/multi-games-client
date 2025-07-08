import { CommandJson } from '@/models/game/command-json';
import { CommandModel } from '@/models/game/command-model';
import { MoveMazeBattleCommandModel, MoveMazeBattleCommandModelPayload } from './move-commands-model';
import { DateVo } from '@/models/global/date-vo';
import { MazeBattleGameStateModel } from '../game-state-model';
import { MazeBattleCommandNameEnum } from '../game-command-name-enum';
import { SwitchPositionMazeBattleCommandModel, SwitchPositionMazeBattleCommandModelPayload } from './switch-position-command-model';
import { ReverseDirectionMazeBattleCommandModel, ReverseDirectionMazeBattleCommandModelPayload } from './reverse-direction-command-model';
import { CancelReverseMazeBattleCommandModel, CancelReverseMazeBattleCommandModelPayload } from './cancel-reverse-command-model';

export function parseMazeBattleGameCommandJson(json: CommandJson): CommandModel<MazeBattleGameStateModel> {
  if (json.name === MazeBattleCommandNameEnum.Move) {
    const payload = json.payload as MoveMazeBattleCommandModelPayload;
    return MoveMazeBattleCommandModel.load({
      id: json.id,
      gameId: json.gameId,
      playerId: json.playerId,
      executedAt: DateVo.fromTimestamp(json.timestamp),
      direction: payload.direction,
    });
  } else if (json.name === MazeBattleCommandNameEnum.SwitchPosition) {
    const payload = json.payload as SwitchPositionMazeBattleCommandModelPayload;
    return SwitchPositionMazeBattleCommandModel.load({
      id: json.id,
      gameId: json.gameId,
      playerId: json.playerId,
      executedAt: DateVo.fromTimestamp(json.timestamp),
      characterId: payload.characterId,
      targetCharacterId: payload.targetCharacterId,
    });
  } else if (json.name === MazeBattleCommandNameEnum.ReverseDirection) {
    const payload = json.payload as ReverseDirectionMazeBattleCommandModelPayload;
    return ReverseDirectionMazeBattleCommandModel.load({
      id: json.id,
      gameId: json.gameId,
      playerId: json.playerId,
      executedAt: DateVo.fromTimestamp(json.timestamp),
      characterId: payload.characterId,
      targetCharacterId: payload.targetCharacterId,
    });
  } else if (json.name === MazeBattleCommandNameEnum.CancelReverse) {
    const payload = json.payload as CancelReverseMazeBattleCommandModelPayload;
    return CancelReverseMazeBattleCommandModel.load({
      id: json.id,
      gameId: json.gameId,
      playerId: json.playerId,
      executedAt: DateVo.fromTimestamp(json.timestamp),
      characterId: payload.characterId,
    });
  }

  throw new Error(`Unknown command name: ${json.name}`);
}
