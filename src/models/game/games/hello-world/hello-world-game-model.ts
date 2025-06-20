import { DateVo } from '@/models/global/date-vo';
import { GameModel } from '../../game-model';
import { HelloWorldGameStateJson } from './hello-world-game-state-json';
import { GameNameEnum } from '../../game-name-enum';

export class HelloWorldGameModel extends GameModel<HelloWorldGameStateJson> {
  private constructor(
    id: string,
    roomId: string,
    name: GameNameEnum,
    started: boolean,
    state: HelloWorldGameStateJson,
    createdAt: DateVo,
    updatedAt: DateVo
  ) {
    super(id, roomId, name, started, state, createdAt, updatedAt);
  }

  static create(
    id: string,
    roomId: string,
    name: GameNameEnum,
    started: boolean,
    state: HelloWorldGameStateJson,
    createdAt: DateVo,
    updatedAt: DateVo
  ) {
    return new HelloWorldGameModel(id, roomId, name, started, state, createdAt, updatedAt);
  }

  public clone(): HelloWorldGameModel {
    return new HelloWorldGameModel(this.id, this.roomId, this.name, this.started, this.state, this.createdAt, this.updatedAt);
  }

  public isEnded(): boolean {
    // any player said hello for 200 times
    const playerIds = Object.keys(this.state);
    for (let i = 0; i < playerIds.length; i += 1) {
      const playerId = playerIds[i];
      const counts = this.state[playerId];
      if (counts && counts.length >= 200) {
        return true;
      }
    }
    return false;
  }
}
