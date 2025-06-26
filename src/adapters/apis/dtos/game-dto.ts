import { GameNameEnum } from '@/models/game/game-name-enum';
import { MazeBattleGameModel } from '@/models/game/games/maze-battle/game-model';
import { MazeBattleGameStateVo } from '@/models/game/games/maze-battle/game-state-vo';
import { DateVo } from '@/models/global/date-vo';

type GameDto = {
  id: string;
  roomId: string;
  name: GameNameEnum;
  started: boolean;
  state: any;
  createdAt: string;
  updatedAt: string;
};

function parseGameDto(dto: GameDto): MazeBattleGameModel {
  const isStateEmpty = Object.keys(dto.state).length === 0;

  if (dto.name === GameNameEnum.MazeBattle) {
    return MazeBattleGameModel.create({
      id: dto.id,
      roomId: dto.roomId,
      name: dto.name,
      started: dto.started,
      state: MazeBattleGameStateVo.fromJson(isStateEmpty ? null : dto.state),
      createdAt: DateVo.parseString(dto.createdAt),
      updatedAt: DateVo.parseString(dto.updatedAt),
    });
  }

  throw new Error(`Unknown game name: ${dto.name}`);
}

export type { GameDto };
export { parseGameDto };
