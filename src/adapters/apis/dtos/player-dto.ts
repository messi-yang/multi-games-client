import { DateVo } from '@/models/global/date-vo';
import { PlayerModel } from '@/models/player/player-model';

type PlayerDto = {
  id: string;
  userId: string;
  name: string;
  hostPriority: number;
  createdAt: string;
  updatedAt: string;
};

function parsePlayerDto(playerDto: PlayerDto): PlayerModel {
  return PlayerModel.create({
    id: playerDto.id,
    userId: playerDto.userId,
    name: playerDto.name,
    hostPriority: playerDto.hostPriority,
    createdAt: DateVo.parseString(playerDto.createdAt),
    updatedAt: DateVo.parseString(playerDto.updatedAt),
  });
}

export type { PlayerDto };
export { parsePlayerDto };
