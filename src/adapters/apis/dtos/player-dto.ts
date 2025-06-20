import { PlayerModel } from '@/models/player/player-model';

type PlayerDto = {
  id: string;
  name: string;
};

function parsePlayerDto(playerDto: PlayerDto): PlayerModel {
  return PlayerModel.create(playerDto.id, playerDto.name);
}

export type { PlayerDto };
export { parsePlayerDto };
