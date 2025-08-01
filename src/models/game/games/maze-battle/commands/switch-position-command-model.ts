import { DateVo } from '@/models/global/date-vo';
import { CommandJson } from '../../../command-json';
import { CommandModel } from '../../../command-model';
import { MazeBattleGameStateModel } from '../game-state-model';
import { MazeBattleCommandNameEnum } from './game-command-name-enum';
import { generateUuidV4 } from '@/utils/uuid';
import { ItemNameEnum } from '../items/item-name-enum';

export type SwitchPositionMazeBattleCommandModelPayload = {
  characterId: string;
  targetCharacterId: string;
};

type CreateProps = {
  gameId: string;
  playerId: string;
  characterId: string;
  targetCharacterId: string;
};

type Props = {
  id: string;
  gameId: string;
  playerId: string;
  executedAt: DateVo;
  characterId: string;
  targetCharacterId: string;
};

export class SwitchPositionMazeBattleCommandModel extends CommandModel<MazeBattleGameStateModel> {
  private characterId: string;

  private targetCharacterId: string;

  constructor(props: Props) {
    super({
      id: props.id,
      gameId: props.gameId,
      playerId: props.playerId,
      name: MazeBattleCommandNameEnum.SwitchPosition,
      executedAt: props.executedAt,
    });
    this.characterId = props.characterId;
    this.targetCharacterId = props.targetCharacterId;
  }

  static create(props: CreateProps): SwitchPositionMazeBattleCommandModel {
    return new SwitchPositionMazeBattleCommandModel({
      ...props,
      id: generateUuidV4(),
      executedAt: DateVo.now(),
    });
  }

  static load(props: Props): SwitchPositionMazeBattleCommandModel {
    return new SwitchPositionMazeBattleCommandModel(props);
  }

  public execute(gameState: MazeBattleGameStateModel): boolean {
    if (!gameState.isStarted()) {
      return false;
    }

    const character = gameState.getCharacter(this.playerId);
    if (!character) {
      return false;
    }

    const targetCharacter = gameState.getCharacter(this.targetCharacterId);
    if (!targetCharacter) {
      return false;
    }

    if (character.getId() === targetCharacter.getId()) {
      return false;
    }

    const firstHeldItem = character.getFirstHeldItem();
    if (!firstHeldItem || firstHeldItem.getName() !== ItemNameEnum.PositionSwitcher) {
      return false;
    }

    const characterPosition = character.getPosition();
    let updatedCharacter = character.removeFirstHeldItem();
    updatedCharacter = updatedCharacter.updatePosition(targetCharacter.getPosition());

    const updatedTargetCharacter = targetCharacter.updatePosition(characterPosition);

    gameState.updateCharacter(updatedCharacter);
    gameState.updateCharacter(updatedTargetCharacter);

    this.setUndoAction(() => {
      gameState.updateCharacter(character);
      gameState.updateCharacter(targetCharacter);
    });

    return true;
  }

  public getPayload(): SwitchPositionMazeBattleCommandModelPayload {
    return {
      characterId: this.characterId,
      targetCharacterId: this.targetCharacterId,
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

  public getTargetCharacterId(): string {
    return this.targetCharacterId;
  }
}
