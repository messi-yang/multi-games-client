import { RoomRoleVo } from '../global/room-role-vo';
import { UserModel } from './user-model';
import { generateUuidV4 } from '@/utils/uuid';

export class RoomMemberModel {
  constructor(private id: string, private roomId: string, private user: UserModel, private roomRole: RoomRoleVo) {}

  static create(id: string, roomId: string, user: UserModel, roomRole: RoomRoleVo): RoomMemberModel {
    return new RoomMemberModel(id, roomId, user, roomRole);
  }

  static createMock(): RoomMemberModel {
    return new RoomMemberModel(generateUuidV4(), generateUuidV4(), UserModel.createMock(), RoomRoleVo.create('admin'));
  }

  public getId(): string {
    return this.id;
  }

  public getRoomId(): string {
    return this.roomId;
  }

  public getUser(): UserModel {
    return this.user;
  }

  public getRoomRole(): RoomRoleVo {
    return this.roomRole;
  }
}
