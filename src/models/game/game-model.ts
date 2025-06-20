import { DateVo } from '../global/date-vo';
import { GameNameEnum } from './game-name-enum';

export abstract class GameModel<State extends object> {
  constructor(
    protected id: string,
    protected roomId: string,
    protected name: GameNameEnum,
    protected started: boolean,
    protected state: State,
    protected createdAt: DateVo,
    protected updatedAt: DateVo
  ) {}

  abstract clone(): GameModel<State>;

  public getId(): string {
    return this.id;
  }

  public getRoomId(): string {
    return this.roomId;
  }

  public getName(): string {
    return this.name;
  }

  public getStarted(): boolean {
    return this.started;
  }

  public getState(): State {
    return this.state;
  }

  public setState(state: State) {
    this.state = state;
  }

  public getCreatedAt(): DateVo {
    return this.createdAt;
  }

  public getUpdatedAt(): DateVo {
    return this.updatedAt;
  }

  abstract isEnded(): boolean;
}
