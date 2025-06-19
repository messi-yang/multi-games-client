import { DateVo } from '../../global/date-vo';
import { generateUuidV4 } from '@/utils/uuid';

export class RoomModel {
  constructor(private id: string, private name: string, private createdAt: DateVo, private updatedAt: DateVo) {}

  static create = (id: string, name: string, createdAt: DateVo, updatedAt: DateVo): RoomModel =>
    new RoomModel(id, name, createdAt, updatedAt);

  static createMock = (): RoomModel => new RoomModel(generateUuidV4(), 'Hello Room', DateVo.now(), DateVo.now());

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getCreatedAt(): DateVo {
    return this.createdAt;
  }

  public getEditedAtCopy(): string {
    const [daysAgo, hoursAgo, minutesAgo, secondsAgo] = [
      this.updatedAt.getDaysAgo(),
      this.updatedAt.getHoursAgo(),
      this.updatedAt.getMinutesAgo(),
      this.updatedAt.getSecondsAgo(),
    ];
    if (secondsAgo < 60) {
      return `Edited ${secondsAgo} seconds ago`;
    } else if (minutesAgo < 60) {
      return `Edited ${minutesAgo} minutes ago`;
    } else if (hoursAgo < 24) {
      return `Edited ${hoursAgo} hours ago`;
    }
    return `Edited ${daysAgo} days ago`;
  }
}
