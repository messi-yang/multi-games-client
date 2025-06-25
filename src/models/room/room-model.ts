import { DateVo } from '../global/date-vo';
import { generateUuidV4 } from '@/utils/uuid';

type Props = {
  id: string;
  name: string;
  createdAt: DateVo;
  updatedAt: DateVo;
};

export class RoomModel {
  private id: string;

  private name: string;

  private createdAt: DateVo;

  private updatedAt: DateVo;

  constructor(props: Props) {
    this.id = props.id;
    this.name = props.name;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create = (props: Props): RoomModel => new RoomModel(props);

  static createMock = (): RoomModel =>
    new RoomModel({ id: generateUuidV4(), name: 'Hello Room', createdAt: DateVo.now(), updatedAt: DateVo.now() });

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
