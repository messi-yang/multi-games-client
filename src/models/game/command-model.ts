import { DateVo } from '../global/date-vo';
import { CommandJson } from './command-json';
import { GameStateVo } from './game-state-vo';

type Props = {
  id: string;
  gameId: string;
  playerId: string;
  name: string;
  executedAt: DateVo;
};

export abstract class CommandModel<GameState extends GameStateVo = GameStateVo> {
  protected id: string;

  protected gameId: string;

  protected playerId: string;

  protected name: string;

  protected executedAt: DateVo;

  constructor(props: Props) {
    this.id = props.id;
    this.gameId = props.gameId;
    this.playerId = props.playerId;
    this.name = props.name;
    this.executedAt = props.executedAt;
  }

  public getId(): string {
    return this.id;
  }

  public getGameId(): string {
    return this.gameId;
  }

  public getPlayerId(): string {
    return this.playerId;
  }

  public getName(): string {
    return this.name;
  }

  public getExecutedAt(): DateVo {
    return this.executedAt;
  }

  public isExecutedBetween(dateA: DateVo, dateB: DateVo) {
    return this.executedAt.isBetween(dateA, dateB);
  }

  abstract getPayload(): object;

  abstract execute(gameState: GameState): GameState;

  abstract toJson(): CommandJson;
}
