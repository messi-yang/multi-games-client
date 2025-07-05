import { DateVo } from '@/models/global/date-vo';
import { CommandJson } from '../../../command-json';
import { CommandModel } from '../../../command-model';
import { MazeBattleGameStateVo } from '../game-state-vo';
import { MazeBattleGameCommandNameEnum } from '../game-command-name-enum';
import { generateUuidV4 } from '@/utils/uuid';

export type MazeBattleGameCancelReverseCommandPayload = {
  characterId: string;
};

type CreateProps = {
  gameId: string;
  playerId: string;
  characterId: string;
};

type Props = {
  id: string;
  gameId: string;
  playerId: string;
  executedAt: DateVo;
  characterId: string;
};

export class MazeBattleGameCancelReverseCommand extends CommandModel<MazeBattleGameStateVo> {
  private characterId: string;

  constructor(props: Props) {
    super({
      id: props.id,
      gameId: props.gameId,
      playerId: props.playerId,
      name: MazeBattleGameCommandNameEnum.CancelReverse,
      executedAt: props.executedAt,
    });
    this.characterId = props.characterId;
  }

  static create(props: CreateProps): MazeBattleGameCancelReverseCommand {
    return new MazeBattleGameCancelReverseCommand({
      ...props,
      id: generateUuidV4(),
      executedAt: DateVo.now(),
    });
  }

  static load(props: Props): MazeBattleGameCancelReverseCommand {
    return new MazeBattleGameCancelReverseCommand(props);
  }

  public execute(gameState: MazeBattleGameStateVo): MazeBattleGameStateVo {
    const character = gameState.getCharacter(this.playerId);
    if (!character) {
      return gameState;
    }

    const updatedCharacter = character.setReversed(false);

    return gameState.updateCharacter(updatedCharacter);
  }

  public getPayload(): MazeBattleGameCancelReverseCommandPayload {
    return {
      characterId: this.characterId,
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

  public getCharacterId(): string {
    return this.characterId;
  }
}
