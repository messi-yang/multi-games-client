import { CommandJson } from '@/models/game/command-json';
import { CommandModel } from '@/models/game/command-model';
import { MoveMazeBattleGameCommandModel, MoveMazeBattleGameCommandModelPayload } from './move-commands-model';
import { DateVo } from '@/models/global/date-vo';
import { MazeBattleGameStateVo } from '../game-state-vo';
import { MazeBattleGameCommandNameEnum } from '../game-command-name-enum';
import { SwitchPositionMazeBattleGameCommandModel, SwitchPositionMazeBattleGameCommandModelPayload } from './switch-position-command-model';
import {
  ReverseDirectionMazeBattleGameCommandModel,
  ReverseDirectionMazeBattleGameCommandModelPayload,
} from './reverse-direction-command-model';
import { CancelReverseMazeBattleGameCommandModel, CancelReverseMazeBattleGameCommandModelPayload } from './cancel-reverse-command-model';

export function parseMazeBattleGameCommandJson(json: CommandJson): CommandModel<MazeBattleGameStateVo> {
  if (json.name === MazeBattleGameCommandNameEnum.Move) {
    const payload = json.payload as MoveMazeBattleGameCommandModelPayload;
    return MoveMazeBattleGameCommandModel.load({
      id: json.id,
      gameId: json.gameId,
      playerId: json.playerId,
      executedAt: DateVo.fromTimestamp(json.timestamp),
      direction: payload.direction,
    });
  } else if (json.name === MazeBattleGameCommandNameEnum.SwitchPosition) {
    const payload = json.payload as SwitchPositionMazeBattleGameCommandModelPayload;
    return SwitchPositionMazeBattleGameCommandModel.load({
      id: json.id,
      gameId: json.gameId,
      playerId: json.playerId,
      executedAt: DateVo.fromTimestamp(json.timestamp),
      characterId: payload.characterId,
      targetCharacterId: payload.targetCharacterId,
    });
  } else if (json.name === MazeBattleGameCommandNameEnum.ReverseDirection) {
    const payload = json.payload as ReverseDirectionMazeBattleGameCommandModelPayload;
    return ReverseDirectionMazeBattleGameCommandModel.load({
      id: json.id,
      gameId: json.gameId,
      playerId: json.playerId,
      executedAt: DateVo.fromTimestamp(json.timestamp),
      characterId: payload.characterId,
      targetCharacterId: payload.targetCharacterId,
    });
  } else if (json.name === MazeBattleGameCommandNameEnum.CancelReverse) {
    const payload = json.payload as CancelReverseMazeBattleGameCommandModelPayload;
    return CancelReverseMazeBattleGameCommandModel.load({
      id: json.id,
      gameId: json.gameId,
      playerId: json.playerId,
      executedAt: DateVo.fromTimestamp(json.timestamp),
      characterId: payload.characterId,
    });
  }

  throw new Error(`Unknown command name: ${json.name}`);
}
