import { DateVo } from '@/models/global/date-vo';
import { CommandJson } from '../../../command-json';
import { CommandModel } from '../../../command-model';
import { HelloWorldGameStateJson } from '../hello-world-game-state-json';
import { generateUuidV4 } from '@/utils/uuid';

export type HelloWorldGameSayHelloCommandPayload = {
  count: number;
};

export class HelloWorldGameSayHelloCommand extends CommandModel<HelloWorldGameStateJson> {
  protected count: number;

  constructor(id: string, gameId: string, playerId: string, executedAt: DateVo, count: number) {
    super(id, gameId, playerId, 'say_hello', executedAt);
    this.count = count;
  }

  static create(gameId: string, playerId: string, count: number): HelloWorldGameSayHelloCommand {
    return new HelloWorldGameSayHelloCommand(generateUuidV4(), gameId, playerId, DateVo.now(), count);
  }

  static load(id: string, gameId: string, playerId: string, executedAt: DateVo, count: number): HelloWorldGameSayHelloCommand {
    return new HelloWorldGameSayHelloCommand(id, gameId, playerId, executedAt, count);
  }

  public execute(gameState: HelloWorldGameStateJson): HelloWorldGameStateJson {
    const character = gameState.characters.find((c) => c.id === this.playerId);
    if (character && this.count === character.count + 1) {
      character.count = this.count;
    }

    return gameState;
  }

  public getPayload(): HelloWorldGameSayHelloCommandPayload {
    return {
      count: this.count,
    };
  }

  toJson(): CommandJson {
    return {
      id: this.id,
      gameId: this.gameId,
      playerId: this.playerId,
      timestamp: this.executedAt.toTimestamp(),
      name: this.name,
      payload: this.getPayload(),
    };
  }
}
