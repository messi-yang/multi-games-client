import { WorldModel } from '@/models/world/world/world-model';
import { PlayerManager } from '../player-manager';
import { PerspectiveManager } from '../perspective-manager';

export type CommandParams = {
  world: WorldModel;
  playerManager: PlayerManager;
  perspectiveManager: PerspectiveManager;
};
