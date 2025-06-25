import { GameNameEnum } from '@/models/game/game-name-enum';
import { HelloWorldGameModel } from '@/models/game/games/hello-world/game-model';
import { HelloWorldGameStateVo } from '@/models/game/games/hello-world/game-state-vo';
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

function parseGameDto(dto: GameDto): HelloWorldGameModel {
  if (dto.name === GameNameEnum.Default) {
    return HelloWorldGameModel.create({
      id: dto.id,
      roomId: dto.roomId,
      name: dto.name,
      started: dto.started,
      state: HelloWorldGameStateVo.fromJson(dto.state),
      createdAt: DateVo.parseString(dto.createdAt),
      updatedAt: DateVo.parseString(dto.updatedAt),
    });
  }

  throw new Error(`Unknown game name: ${dto.name}`);
}

export type { GameDto };
export { parseGameDto };
