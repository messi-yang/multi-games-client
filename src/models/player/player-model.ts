import { generateUuidV4 } from '@/utils/uuid';
import { DateVo } from '../global/date-vo';

type Props = {
  id: string;
  userId: string;
  name: string;
  hostPriority: number;
  createdAt: DateVo;
  updatedAt: DateVo;
};

export class PlayerModel {
  private id: string;

  private userId: string;

  private name: string;

  private hostPriority: number;

  private createdAt: DateVo;

  private updatedAt: DateVo;

  private constructor(props: Props) {
    this.id = props.id;
    this.userId = props.userId;
    this.name = props.name;
    this.hostPriority = props.hostPriority;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Props): PlayerModel {
    return new PlayerModel(props);
  }

  static createMock(): PlayerModel {
    return PlayerModel.create({
      id: generateUuidV4(),
      userId: generateUuidV4(),
      name: 'Test Player',
      hostPriority: 0,
      createdAt: DateVo.now(),
      updatedAt: DateVo.now(),
    });
  }

  public clone(): PlayerModel {
    return new PlayerModel({
      id: this.id,
      userId: this.userId,
      name: this.name,
      hostPriority: this.hostPriority,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  public getId(): string {
    return this.id;
  }

  public hasAccount(): boolean {
    return !!this.userId;
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
