import { DirectionVo } from '../common/direction-vo';
import { PlayerActionVo } from './player-action-vo';
import { PlayerActionNameEnum } from './player-action-name-enum';
import { PrecisePositionVo } from '../common/precise-position-vo';
import { PositionVo } from '../common/position-vo';
import { generateUuidV4 } from '@/utils/uuid';

export class PlayerModel {
  constructor(
    private id: string,
    private name: string,
    private action: PlayerActionVo,
    private precisePosition: PrecisePositionVo,
    private frozen: boolean
  ) {
    this.precisePosition = precisePosition;
  }

  static create(id: string, name: string, action: PlayerActionVo, precisePosition: PrecisePositionVo): PlayerModel {
    return new PlayerModel(id, name, action, precisePosition, false);
  }

  static createMock(): PlayerModel {
    return PlayerModel.create(
      generateUuidV4(),
      'Test Player',
      PlayerActionVo.create(PlayerActionNameEnum.Stand, DirectionVo.create(2)),
      PrecisePositionVo.create(0, 0)
    );
  }

  public clone(): PlayerModel {
    return new PlayerModel(this.id, this.name, this.action, this.precisePosition, this.frozen);
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDirection(): DirectionVo {
    return this.action.getDirection();
  }

  public getAction(): PlayerActionVo {
    return this.action;
  }

  public updateAction(action: PlayerActionVo) {
    if (this.frozen) return;
    this.action = action;
  }

  public getPosition(): PositionVo {
    return this.precisePosition.toPosition();
  }

  public getPrecisePosition(): PrecisePositionVo {
    return this.precisePosition;
  }

  public updatePrecisePosition(pos: PrecisePositionVo) {
    if (this.frozen) return;
    this.precisePosition = pos;
  }

  /**
   * Get the forward position of the player with distance, be aware that the return value is PositionVo not PrecisePositionVo
   */
  public getFowardPosition(distance: number): PositionVo {
    const direction = this.getDirection();
    if (direction.isUp()) {
      return this.precisePosition.shift(PrecisePositionVo.create(0, -distance, 0)).toPosition();
    } else if (direction.isRight()) {
      return this.precisePosition.shift(PrecisePositionVo.create(distance, 0, 0)).toPosition();
    } else if (direction.isDown()) {
      return this.precisePosition.shift(PrecisePositionVo.create(0, distance, 0)).toPosition();
    } else if (direction.isLeft()) {
      return this.precisePosition.shift(PrecisePositionVo.create(-distance, 0, 0)).toPosition();
    } else {
      return this.precisePosition.shift(PrecisePositionVo.create(0, distance, 0)).toPosition();
    }
  }

  public getFrozen(): boolean {
    return this.frozen;
  }

  public freeze() {
    this.frozen = true;
  }

  public unfreeze() {
    this.frozen = false;
  }
}
