import { DateVo } from '@/models/global/date-vo';
import { CommandJson } from '../../../command-json';
import { CommandModel } from '../../../command-model';
import { MazeBattleGameStateModel } from '../game-state-model';
import { MazeBattleCommandNameEnum } from './game-command-name-enum';
import { generateUuidV4 } from '@/utils/uuid';

export type CancelBlindMazeBattleCommandModelPayload = {
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

export class CancelBlindMazeBattleCommandModel extends CommandModel<MazeBattleGameStateModel> {
  private characterId: string;

  constructor(props: Props) {
    super({
      id: props.id,
      gameId: props.gameId,
      playerId: props.playerId,
      name: MazeBattleCommandNameEnum.CancelBlind,
      executedAt: props.executedAt,
    });
    this.characterId = props.characterId;
  }

  static create(props: CreateProps): CancelBlindMazeBattleCommandModel {
    return new CancelBlindMazeBattleCommandModel({
      ...props,
      id: generateUuidV4(),
      executedAt: DateVo.now(),
    });
  }

  static load(props: Props): CancelBlindMazeBattleCommandModel {
    return new CancelBlindMazeBattleCommandModel(props);
  }

  public execute(gameState: MazeBattleGameStateModel): boolean {
    if (!gameState.isStarted()) {
      return false;
    }

    const character = gameState.getCharacter(this.playerId);
    if (!character) {
      return false;
    }

    gameState.updateCharacter(character.setBlinded(false));

    this.setUndoAction(() => {
      gameState.updateCharacter(character);
    });

    return true;
  }

  public getPayload(): CancelBlindMazeBattleCommandModelPayload {
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
