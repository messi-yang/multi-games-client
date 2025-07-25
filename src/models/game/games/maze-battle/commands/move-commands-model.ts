import { DateVo } from '@/models/global/date-vo';
import { CommandJson } from '../../../command-json';
import { CommandModel } from '../../../command-model';
import { MazeBattleGameStateModel } from '../game-state-model';
import { MazeBattleCommandNameEnum } from './game-command-name-enum';
import { generateUuidV4 } from '@/utils/uuid';
import { WallVo } from '../wall-vo';
import { DirectionEnum } from '../direction-enum';
import { reverseDirection } from '../utils';
import { ItemBoxVo } from '../item-box-vo';

export type MoveMazeBattleCommandModelPayload = {
  direction: DirectionEnum;
};

type CreateProps = {
  gameId: string;
  playerId: string;
  direction: DirectionEnum;
};

type Props = {
  id: string;
  gameId: string;
  playerId: string;
  executedAt: DateVo;
  direction: DirectionEnum;
};

export class MoveMazeBattleCommandModel extends CommandModel<MazeBattleGameStateModel> {
  private direction: DirectionEnum;

  constructor(props: Props) {
    super({
      id: props.id,
      gameId: props.gameId,
      playerId: props.playerId,
      name: MazeBattleCommandNameEnum.Move,
      executedAt: props.executedAt,
    });
    this.direction = props.direction;
  }

  static create(props: CreateProps): MoveMazeBattleCommandModel {
    return new MoveMazeBattleCommandModel({
      ...props,
      id: generateUuidV4(),
      executedAt: DateVo.now(),
    });
  }

  static load(props: Props): MoveMazeBattleCommandModel {
    return new MoveMazeBattleCommandModel(props);
  }

  public execute(gameState: MazeBattleGameStateModel): boolean {
    if (!gameState.isStarted()) {
      return false;
    }

    const character = gameState.getCharacter(this.playerId);
    if (!character) {
      return false;
    }

    let newPosition = character.getPosition().shift(0, 0);

    let { direction } = this;
    if (character.isReversed()) {
      direction = reverseDirection(direction);
    }

    switch (direction) {
      case DirectionEnum.Left:
        newPosition = newPosition.shift(-1, 0);
        break;
      case DirectionEnum.Right:
        newPosition = newPosition.shift(1, 0);
        break;
      case DirectionEnum.Up:
        newPosition = newPosition.shift(0, -1);
        break;
      case DirectionEnum.Down:
        newPosition = newPosition.shift(0, 1);
        break;
      default:
        break;
    }

    const maze = gameState.getMaze();
    const cell = maze.getCell(newPosition);
    if (!cell || cell instanceof WallVo) {
      return false;
    }

    let updatedCharacter = character.updatePosition(newPosition);
    if (newPosition.equals(maze.getEndPosition())) {
      updatedCharacter = updatedCharacter.setReachedGoadAt(DateVo.now());
    }

    const itemBox = gameState.getItemBoxAtPosition(newPosition);
    let removedItemBox: ItemBoxVo | null = null;
    if (itemBox && updatedCharacter.getHeldItems().length < 2) {
      updatedCharacter = updatedCharacter.addHeldItem(itemBox.getItem());
      gameState.removeItemBoxAtPosition(newPosition);
      removedItemBox = itemBox;
    }
    gameState.updateCharacter(updatedCharacter);

    this.setUndoAction(() => {
      gameState.updateCharacter(character);
      if (removedItemBox) {
        gameState.addItemBox(removedItemBox);
      }
    });

    return true;
  }

  public getPayload(): MoveMazeBattleCommandModelPayload {
    return {
      direction: this.direction,
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
