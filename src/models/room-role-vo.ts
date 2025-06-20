type Role = 'owner' | 'admin' | 'editor' | 'viewer';

export class RoomRoleVo {
  constructor(private role: Role) {}

  static create(role: Role) {
    return new RoomRoleVo(role);
  }

  public toString(): string {
    return this.role;
  }
}
