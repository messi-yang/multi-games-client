import { RoomModel } from '@/models/room/room-model';
import { DateVo } from '@/models/global/date-vo';

type RoomDto = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

function parseRoomDto(dto: RoomDto): RoomModel {
  return RoomModel.create({
    id: dto.id,
    name: dto.name,
    createdAt: DateVo.parseString(dto.createdAt),
    updatedAt: DateVo.parseString(dto.updatedAt),
  });
}

export type { RoomDto };
export { parseRoomDto };
