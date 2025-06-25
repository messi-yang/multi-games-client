import { DateVo } from '../global/date-vo';
import { PlayerModel } from '../player/player-model';
import { GameNameEnum } from './game-name-enum';
import { GameStateVo } from './game-state-vo';

type Props<GameState extends GameStateVo = GameStateVo> = {
  id: string;
  roomId: string;
  name: GameNameEnum;
  started: boolean;
  state: GameState;
  createdAt: DateVo;
  updatedAt: DateVo;
};

export abstract class GameModel<GameState extends GameStateVo = GameStateVo> {
  protected id: string;

  protected roomId: string;

  protected name: GameNameEnum;

  protected started: boolean;

  protected state: GameState;

  protected createdAt: DateVo;

  protected updatedAt: DateVo;

  constructor(props: Props<GameState>) {
    this.id = props.id;
    this.roomId = props.roomId;
    this.name = props.name;
    this.started = props.started;
    this.state = props.state;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  abstract clone(): GameModel<GameState>;

  public getId(): string {
    return this.id;
  }

  public getRoomId(): string {
    return this.roomId;
  }

  public getName(): string {
    return this.name;
  }

  abstract isPlayerInGame(playerId: string): boolean;

  public getState(): GameState {
    return this.state;
  }

  public setState(state: GameState) {
    this.state = state;
  }

  public getCreatedAt(): DateVo {
    return this.createdAt;
  }

  public getUpdatedAt(): DateVo {
    return this.updatedAt;
  }

  abstract generateInitialState(players: PlayerModel[]): GameState;

  public hasStarted(): boolean {
    return this.started;
  }

  abstract isEnded(): boolean;
}
