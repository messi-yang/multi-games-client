import { GameNameEnum } from '@/models/game/game-name-enum';
import { MazeBattleGameModel } from '@/models/game/games/maze-battle/game-model';
import { MazeBattleGameStateJson, MazeBattleGameStateVo } from '@/models/game/games/maze-battle/game-state-vo';
import { DateVo } from '@/models/global/date-vo';

type GameDto = {
  id: string;
  roomId: string;
  name: GameNameEnum;
  started: boolean;
  state: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

function parseGameDto(dto: GameDto): MazeBattleGameModel {
  if (dto.name === GameNameEnum.MazeBattle) {
    const state = dto.state ? MazeBattleGameStateVo.fromJson(dto.state as MazeBattleGameStateJson) : null;

    return MazeBattleGameModel.create({
      id: dto.id,
      roomId: dto.roomId,
      name: dto.name,
      started: dto.started,
      state,
      createdAt: DateVo.parseString(dto.createdAt),
      updatedAt: DateVo.parseString(dto.updatedAt),
    });
  }

  throw new Error(`Unknown game name: ${dto.name}`);
}

export type { GameDto };
export { parseGameDto };
