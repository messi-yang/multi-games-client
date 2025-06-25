import { DateVo } from '@/models/global/date-vo';
import { CommandJson } from '../../../command-json';
import { CommandModel } from '../../../command-model';
import { HelloWorldGameStateVo } from '../game-state-vo';
import { HelloWorldGameCommandNameEnum } from '../game-command-name-enum';
import { generateUuidV4 } from '@/utils/uuid';

export type HelloWorldGameSayHelloCommandPayload = {
  count: number;
};

type CreateProps = {
  gameId: string;
  playerId: string;
  count: number;
};

type Props = {
  id: string;
  gameId: string;
  playerId: string;
  executedAt: DateVo;
  count: number;
};

export class HelloWorldGameSayHelloCommand extends CommandModel<HelloWorldGameStateVo> {
  protected count: number;

  constructor(props: Props) {
    super({
      id: props.id,
      gameId: props.gameId,
      playerId: props.playerId,
      name: HelloWorldGameCommandNameEnum.SayHello,
      executedAt: props.executedAt,
    });
    this.count = props.count;
  }

  static create(props: CreateProps): HelloWorldGameSayHelloCommand {
    return new HelloWorldGameSayHelloCommand({
      ...props,
      id: generateUuidV4(),
      executedAt: DateVo.now(),
    });
  }

  static load(props: Props): HelloWorldGameSayHelloCommand {
    return new HelloWorldGameSayHelloCommand(props);
  }

  public execute(gameState: HelloWorldGameStateVo): HelloWorldGameStateVo {
    return gameState.addCharacterCount(this.playerId, this.count);
  }

  public getPayload(): HelloWorldGameSayHelloCommandPayload {
    return {
      count: this.count,
    };
  }

  public toJson(): CommandJson {
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
