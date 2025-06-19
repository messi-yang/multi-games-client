import { PositionVo } from '@/models/game/common/position-vo';

type PositionDto = {
  x: number;
  z: number;
};

const newPositionDto = (position: PositionVo): PositionDto => ({
  x: position.getX(),
  z: position.getZ(),
});

export type { PositionDto };
export { newPositionDto };
