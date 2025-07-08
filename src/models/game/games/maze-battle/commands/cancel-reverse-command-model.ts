import { DateVo } from '@/models/global/date-vo';
import { CommandJson } from '../../../command-json';
import { CommandModel } from '../../../command-model';
import { MazeBattleGameStateModel } from '../game-state-model';
import { MazeBattleCommandNameEnum } from '../game-command-name-enum';
import { generateUuidV4 } from '@/utils/uuid';

export type CancelReverseMazeBattleCommandModelPayload = {
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

export class CancelReverseMazeBattleCommandModel extends CommandModel<MazeBattleGameStateModel> {
  private characterId: string;

  constructor(props: Props) {
    super({
      id: props.id,
      gameId: props.gameId,
      playerId: props.playerId,
      name: MazeBattleCommandNameEnum.CancelReverse,
      executedAt: props.executedAt,
    });
    this.characterId = props.characterId;
  }

  static create(props: CreateProps): CancelReverseMazeBattleCommandModel {
    return new CancelReverseMazeBattleCommandModel({
      ...props,
      id: generateUuidV4(),
      executedAt: DateVo.now(),
    });
  }

  static load(props: Props): CancelReverseMazeBattleCommandModel {
    return new CancelReverseMazeBattleCommandModel(props);
  }

  public execute(gameState: MazeBattleGameStateModel): MazeBattleGameStateModel {
    if (!gameState.isStarted()) {
      return gameState;
    }

    const character = gameState.getCharacter(this.playerId);
    if (!character) {
      return gameState;
    }

    const updatedCharacter = character.setReversed(false);

    return gameState.updateCharacter(updatedCharacter);
  }

  public getPayload(): CancelReverseMazeBattleCommandModelPayload {
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
