import { UserDto, parseUserDto } from './user-dto';
import { RoomRoleDto, parseRoomRoleDto } from './room-role-dto';
import { RoomMemberModel } from '@/models/room-member-model';

type RoomMemberDto = {
  id: string;
  roomId: string;
  user: UserDto;
  role: RoomRoleDto;
};

function parseRoomMemberDto(dto: RoomMemberDto): RoomMemberModel {
  return RoomMemberModel.create(dto.id, dto.roomId, parseUserDto(dto.user), parseRoomRoleDto(dto.role));
}

export type { RoomMemberDto };
export { parseRoomMemberDto };
