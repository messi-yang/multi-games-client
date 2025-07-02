import { generateUuidV4 } from '@/utils/uuid';
import { DateVo } from '../global/date-vo';

type Props = {
  id: string;
  playerName: string | null;
  content: string;
  createdAt: DateVo;
};

type CreateProps = {
  playerName: string | null;
  content: string;
};

export class MessageModel {
  private id: string;

  private playerName: string | null;

  private content: string;

  private createdAt: DateVo;

  private constructor(props: Props) {
    this.id = props.id;
    this.playerName = props.playerName;
    this.content = props.content;
    this.createdAt = props.createdAt;
  }

  public static create(props: CreateProps): MessageModel {
    return new MessageModel({
      id: generateUuidV4(),
      playerName: props.playerName,
      content: props.content,
      createdAt: DateVo.now(),
    });
  }

  public static load(props: Props): MessageModel {
    return new MessageModel(props);
  }

  public getId(): string {
    return this.id;
  }

  public getPlayerName(): string | null {
    return this.playerName;
  }

  public getContent(): string {
    return this.content;
  }

  public getCreatedAt(): DateVo {
    return this.createdAt;
  }
}
