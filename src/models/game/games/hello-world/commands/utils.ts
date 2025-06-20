import { CommandJson } from '@/models/game/command-json';
import { CommandModel } from '@/models/game/command-model';
import { HelloWorldGameStateJson } from '../hello-world-game-state-json';
import { HelloWorldGameSayHelloCommand, HelloWorldGameSayHelloCommandPayload } from './hello-world-game-say-hello-commands';
import { DateVo } from '@/models/global/date-vo';

export function parseHelloWorldGameCommandJson(json: CommandJson): CommandModel<HelloWorldGameStateJson> {
  if (json.name === 'say_hello') {
    const payload = json.payload as HelloWorldGameSayHelloCommandPayload;
    return new HelloWorldGameSayHelloCommand(json.id, json.gameId, json.playerId, DateVo.fromTimestamp(json.timestamp), payload.count);
  }

  throw new Error(`Unknown command name: ${json.name}`);
}
