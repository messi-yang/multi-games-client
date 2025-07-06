import { DateVo } from '@/models/global/date-vo';
import { CommandJson } from '../../../command-json';
import { CommandModel } from '../../../command-model';
import { MazeBattleGameStateVo } from '../game-state-vo';
import { MazeBattleGameCommandNameEnum } from '../game-command-name-enum';
import { generateUuidV4 } from '@/utils/uuid';
import { WallVo } from '../wall-vo';
import { DirectionEnum } from '../direction-enum';
import { reverseDirection } from '../utils';

export type MazeBattleGameMoveCommandPayload = {
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

export class MazeBattleGameMoveCommand extends CommandModel<MazeBattleGameStateVo> {
  private direction: DirectionEnum;

  constructor(props: Props) {
    super({
      id: props.id,
      gameId: props.gameId,
      playerId: props.playerId,
      name: MazeBattleGameCommandNameEnum.Move,
      executedAt: props.executedAt,
    });
    this.direction = props.direction;
  }

  static create(props: CreateProps): MazeBattleGameMoveCommand {
    return new MazeBattleGameMoveCommand({
      ...props,
      id: generateUuidV4(),
      executedAt: DateVo.now(),
    });
  }

  static load(props: Props): MazeBattleGameMoveCommand {
    return new MazeBattleGameMoveCommand(props);
  }

  public execute(gameState: MazeBattleGameStateVo): MazeBattleGameStateVo {
    if (!gameState.isStarted()) {
      return gameState;
    }

    const character = gameState.getCharacter(this.playerId);
    if (!character) {
      return gameState;
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
      return gameState;
    }

    let newCharacter = character.updatePosition(newPosition);
    if (newPosition.equals(maze.getEndPosition())) {
      newCharacter = newCharacter.setReachedGoadAt(DateVo.now());
    }

    const itemBox = gameState.getItemBoxAtPosition(newPosition);
    if (itemBox && newCharacter.getHeldItems().length < 2) {
      newCharacter = newCharacter.addHeldItem(itemBox.getItem());
      gameState = gameState.removeItemBoxAtPosition(newPosition);
    }

    return gameState.updateCharacter(newCharacter);
  }

  public getPayload(): MazeBattleGameMoveCommandPayload {
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
