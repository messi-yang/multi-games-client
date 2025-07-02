import { DateVo } from '@/models/global/date-vo';
import { CommandJson } from '../../../command-json';
import { CommandModel } from '../../../command-model';
import { MazeBattleGameStateVo } from '../game-state-vo';
import { MazeBattleGameCommandNameEnum } from '../game-command-name-enum';
import { generateUuidV4 } from '@/utils/uuid';
import { ItemNameEnum } from '../item-name-enum';

export type MazeBattleGameReverseDirectionCommandPayload = {
  characterId: string;
  itemIndex: number;
  targetCharacterId: string;
};

type CreateProps = {
  gameId: string;
  playerId: string;
  characterId: string;
  itemIndex: number;
  targetCharacterId: string;
};

type Props = {
  id: string;
  gameId: string;
  playerId: string;
  executedAt: DateVo;
  characterId: string;
  itemIndex: number;
  targetCharacterId: string;
};

export class MazeBattleGameReverseDirectionCommand extends CommandModel<MazeBattleGameStateVo> {
  private characterId: string;

  private itemIndex: number;

  private targetCharacterId: string;

  constructor(props: Props) {
    super({
      id: props.id,
      gameId: props.gameId,
      playerId: props.playerId,
      name: MazeBattleGameCommandNameEnum.ReverseDirection,
      executedAt: props.executedAt,
    });
    this.characterId = props.characterId;
    this.itemIndex = props.itemIndex;
    this.targetCharacterId = props.targetCharacterId;
  }

  static create(props: CreateProps): MazeBattleGameReverseDirectionCommand {
    return new MazeBattleGameReverseDirectionCommand({
      ...props,
      id: generateUuidV4(),
      executedAt: DateVo.now(),
    });
  }

  static load(props: Props): MazeBattleGameReverseDirectionCommand {
    return new MazeBattleGameReverseDirectionCommand(props);
  }

  public execute(gameState: MazeBattleGameStateVo): MazeBattleGameStateVo {
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

    const item = character.getHeldItem(this.itemIndex);
    if (!item || item.getName() !== ItemNameEnum.DirectionReverser) {
      return gameState;
    }

    const updatedCharacter = character.removeHeldItem(this.itemIndex);

    const updatedTargetCharacter = targetCharacter.setReversed(!targetCharacter.isReversed());

    return gameState.updateCharacter(updatedCharacter).updateCharacter(updatedTargetCharacter);
  }

  public getPayload(): MazeBattleGameReverseDirectionCommandPayload {
    return {
      characterId: this.characterId,
      itemIndex: this.itemIndex,
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
}
