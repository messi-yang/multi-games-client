import { DateVo } from '../global/date-vo';
import { CommandJson } from './command-json';

export abstract class CommandModel<GameState extends object> {
  constructor(
    protected id: string,
    protected gameId: string,
    protected playerId: string,
    protected name: string,
    protected executedAt: DateVo
  ) {}

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
