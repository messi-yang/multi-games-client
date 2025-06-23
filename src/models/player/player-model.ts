import { generateUuidV4 } from '@/utils/uuid';
import { DateVo } from '../global/date-vo';

export class PlayerModel {
  constructor(
    protected id: string,
    protected userId: string,
    protected name: string,
    protected hostPriority: number,
    protected createdAt: string,
    protected updatedAt: string
  ) {}

  static create(id: string, userId: string, name: string, hostPriority: number, createdAt: string, updatedAt: string): PlayerModel {
    return new PlayerModel(id, userId, name, hostPriority ?? 0, createdAt, updatedAt);
  }

  static createMock(): PlayerModel {
    return PlayerModel.create(generateUuidV4(), generateUuidV4(), 'Test Player', 0, DateVo.now().toIsoString(), DateVo.now().toIsoString());
  }

  public clone(): PlayerModel {
    return new PlayerModel(this.id, this.userId, this.name, this.hostPriority, this.createdAt, this.updatedAt);
  }

  public getId(): string {
    return this.id;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getName(): string {
    return this.name;
  }

  public getHostPriority(): number {
    return this.hostPriority;
  }
}
