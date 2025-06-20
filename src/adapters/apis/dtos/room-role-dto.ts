import { RoomRoleVo } from '@/models/room-role-vo';

type RoomRoleDto = 'owner' | 'admin' | 'editor' | 'viewer';

function parseRoomRoleDto(dto: RoomRoleDto): RoomRoleVo {
  return RoomRoleVo.create(dto);
}

export type { RoomRoleDto };
export { parseRoomRoleDto };
