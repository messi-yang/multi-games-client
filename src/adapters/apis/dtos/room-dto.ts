import { RoomModel } from '@/models/game/room/room-model';
import { DateVo } from '@/models/global/date-vo';

type RoomDto = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

function parseRoomDto(dto: RoomDto): RoomModel {
  return RoomModel.create(dto.id, dto.name, DateVo.parseString(dto.createdAt), DateVo.parseString(dto.updatedAt));
}

export type { RoomDto };
export { parseRoomDto };
