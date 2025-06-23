import { DateVo } from '@/models/global/date-vo';
import { GameModel } from '../../game-model';
import { HelloWorldGameStateJson } from './hello-world-game-state-json';
import { GameNameEnum } from '../../game-name-enum';
import { PlayerModel } from '@/models/player/player-model';

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

  public generateInitialState(players: PlayerModel[]): HelloWorldGameStateJson {
    const state: HelloWorldGameStateJson = {
      characters: [],
    };
    for (let i = 0; i < players.length; i += 1) {
      const player = players[i];
      state.characters.push({
        id: player.getId(),
        count: 0,
        name: player.getName(),
      });
    }
    return state;
  }

  public isEnded(): boolean {
    for (let i = 0; i < this.state.characters.length; i += 1) {
      const character = this.state.characters[i];
      if (character && character.count >= 200) {
        return true;
      }
    }
    return false;
  }
}
