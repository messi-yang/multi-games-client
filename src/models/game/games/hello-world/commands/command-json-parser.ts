import { CommandJson } from '@/models/game/command-json';
import { CommandModel } from '@/models/game/command-model';
import { HelloWorldGameSayHelloCommand, HelloWorldGameSayHelloCommandPayload } from './say-hello-commands';
import { DateVo } from '@/models/global/date-vo';
import { HelloWorldGameStateVo } from '../game-state-vo';
import { HelloWorldGameCommandNameEnum } from '../game-command-name-enum';

export function parseHelloWorldGameCommandJson(json: CommandJson): CommandModel<HelloWorldGameStateVo> {
  if (json.name === HelloWorldGameCommandNameEnum.SayHello) {
    const payload = json.payload as HelloWorldGameSayHelloCommandPayload;
    return HelloWorldGameSayHelloCommand.load({
      id: json.id,
      gameId: json.gameId,
      playerId: json.playerId,
      executedAt: DateVo.fromTimestamp(json.timestamp),
      count: payload.count,
    });
  }

  throw new Error(`Unknown command name: ${json.name}`);
}
