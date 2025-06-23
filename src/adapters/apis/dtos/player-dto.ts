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
  return PlayerModel.create(
    playerDto.id,
    playerDto.userId,
    playerDto.name,
    playerDto.hostPriority,
    playerDto.createdAt,
    playerDto.updatedAt
  );
}

export type { PlayerDto };
export { parsePlayerDto };
