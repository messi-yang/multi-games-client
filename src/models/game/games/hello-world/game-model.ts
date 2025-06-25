import { DateVo } from '@/models/global/date-vo';
import { GameModel } from '../../game-model';
import { GameNameEnum } from '../../game-name-enum';
import { PlayerModel } from '@/models/player/player-model';
import { HelloWorldGameStateVo } from './game-state-vo';

type Props = {
  id: string;
  roomId: string;
  name: GameNameEnum;
  started: boolean;
  state: HelloWorldGameStateVo;
  createdAt: DateVo;
  updatedAt: DateVo;
};

export class HelloWorldGameModel extends GameModel<HelloWorldGameStateVo> {
  private constructor(props: Props) {
    super(props);
  }

  static create(props: Props): HelloWorldGameModel {
    return new HelloWorldGameModel(props);
  }

  public clone(): HelloWorldGameModel {
    return new HelloWorldGameModel({
      id: this.id,
      roomId: this.roomId,
      name: this.name,
      started: this.started,
      state: this.state,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  public generateInitialState(players: PlayerModel[]): HelloWorldGameStateVo {
    const characters: { id: string; count: number; name: string }[] = [];
    for (let i = 0; i < players.length; i += 1) {
      const player = players[i];
      characters.push({
        id: player.getId(),
        count: 0,
        name: player.getName(),
      });
    }
    return HelloWorldGameStateVo.create({ characters });
  }

  public isPlayerInGame(playerId: string): boolean {
    return this.state.isPlayerInGame(playerId);
  }

  public isEnded(): boolean {
    return this.state.isEnded();
  }
}
