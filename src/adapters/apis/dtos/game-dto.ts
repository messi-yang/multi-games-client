import { GameNameEnum } from '@/models/game/game-name-enum';
import { HelloWorldGameModel } from '@/models/game/games/hello-world/hello-world-game-model';
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
    return HelloWorldGameModel.create(
      dto.id,
      dto.roomId,
      dto.name,
      dto.started,
      dto.state,
      DateVo.parseString(dto.createdAt),
      DateVo.parseString(dto.updatedAt)
    );
  }

  throw new Error(`Unknown game name: ${dto.name}`);
}

export type { GameDto };
export { parseGameDto };
