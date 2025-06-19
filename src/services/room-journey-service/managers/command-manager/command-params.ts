import { RoomModel } from '@/models/game/room/room-model';
import { PlayerManager } from '../player-manager';
import { PerspectiveManager } from '../perspective-manager';

export type CommandParams = {
  room: RoomModel;
  playerManager: PlayerManager;
  perspectiveManager: PerspectiveManager;
};
