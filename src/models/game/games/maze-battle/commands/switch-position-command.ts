import { DateVo } from '@/models/global/date-vo';
import { CommandJson } from '../../../command-json';
import { CommandModel } from '../../../command-model';
import { MazeBattleGameStateVo } from '../game-state-vo';
import { MazeBattleGameCommandNameEnum } from '../game-command-name-enum';
import { generateUuidV4 } from '@/utils/uuid';
import { ItemNameEnum } from '../items/item-name-enum';

export type MazeBattleGameSwitchPositionCommandPayload = {
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

export class MazeBattleGameSwitchPositionCommand extends CommandModel<MazeBattleGameStateVo> {
  private characterId: string;

  private targetCharacterId: string;

  constructor(props: Props) {
    super({
      id: props.id,
      gameId: props.gameId,
      playerId: props.playerId,
      name: MazeBattleGameCommandNameEnum.SwitchPosition,
      executedAt: props.executedAt,
    });
    this.characterId = props.characterId;
    this.targetCharacterId = props.targetCharacterId;
  }

  static create(props: CreateProps): MazeBattleGameSwitchPositionCommand {
    return new MazeBattleGameSwitchPositionCommand({
      ...props,
      id: generateUuidV4(),
      executedAt: DateVo.now(),
    });
  }

  static load(props: Props): MazeBattleGameSwitchPositionCommand {
    return new MazeBattleGameSwitchPositionCommand(props);
  }

  public execute(gameState: MazeBattleGameStateVo): MazeBattleGameStateVo {
    if (!gameState.isStarted()) {
      return gameState;
    }

    const character = gameState.getCharacter(this.playerId);
    if (!character) {
      return gameState;
    }

    const targetCharacter = gameState.getCharacter(this.targetCharacterId);
    if (!targetCharacter) {
      return gameState;
    }

    if (character.getId() === targetCharacter.getId()) {
      return gameState;
    }

    const item = character.getFirstHeldItem();
    if (!item || item.getName() !== ItemNameEnum.PositionSwitcher) {
      return gameState;
    }

    const characterPosition = character.getPosition();
    let updatedCharacter = character.removeFirstHeldItem();
    updatedCharacter = updatedCharacter.updatePosition(targetCharacter.getPosition());

    const updatedTargetCharacter = targetCharacter.updatePosition(characterPosition);

    return gameState.updateCharacter(updatedCharacter).updateCharacter(updatedTargetCharacter);
  }

  public getPayload(): MazeBattleGameSwitchPositionCommandPayload {
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
