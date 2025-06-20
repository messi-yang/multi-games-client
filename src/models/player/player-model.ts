import { generateUuidV4 } from '@/utils/uuid';

export class PlayerModel {
  constructor(private id: string, private name: string) {}

  static create(id: string, name: string): PlayerModel {
    return new PlayerModel(id, name);
  }

  static createMock(): PlayerModel {
    return PlayerModel.create(generateUuidV4(), 'Test Player');
  }

  public clone(): PlayerModel {
    return new PlayerModel(this.id, this.name);
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }
}
