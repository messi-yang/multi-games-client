import { PlayerModel } from '@/models/game/player/player-model';
import { RoomModel } from '@/models/game/room/room-model';
import { PositionVo } from '@/models/game/common/position-vo';
import { PlayerManager } from './managers/player-manager';
import { PerspectiveManager } from './managers/perspective-manager';
import { Command } from './managers/command-manager/command';
import { CommandManager } from './managers/command-manager';
import { ChangePlayerPrecisePositionCommand } from './managers/command-manager/commands/change-player-precise-position-command';
import { EventHandlerSubscriber } from '../../event-dispatchers/common/event-handler';

export class RoomJourneyService {
  private room: RoomModel;

  private playerManager: PlayerManager;

  private commandManager: CommandManager;

  private perspectiveManager: PerspectiveManager;

  private animateId: number | null = null;

  private updatePlayerPositionTickFps;

  private updatePlayerPositionTickCount;

  constructor(room: RoomModel, players: PlayerModel[], myPlayerId: string) {
    this.room = room;

    this.playerManager = PlayerManager.create(players, myPlayerId);

    this.perspectiveManager = PerspectiveManager.create();

    this.commandManager = CommandManager.create(room, this.playerManager, this.perspectiveManager);

    this.updatePlayerPositionTickFps = 24;
    this.updatePlayerPositionTickCount = 0;
    this.updatePlayerPositionTicker();
  }

  public destroy() {
    if (this.animateId !== null) {
      cancelAnimationFrame(this.animateId);
    }
  }

  static create(room: RoomModel, players: PlayerModel[], myPlayerId: string) {
    return new RoomJourneyService(room, players, myPlayerId);
  }

  public removeFailedCommand(commandId: string) {
    this.commandManager.removeFailedCommand(commandId);
  }

  /**
   * Replays commands executed within the specified duration.
   * @param duration miliseconds
   * @param speed 1 is normal speed
   */
  public replayCommands(duration: number, speed: number) {
    this.commandManager.replayCommands(duration, speed);
  }

  public executeRemoteCommand(command: Command) {
    this.commandManager.executeRemoteCommand(command);
  }

  public executeLocalCommand(command: Command) {
    this.commandManager.executeLocalCommand(command);
  }

  public getCameraPosition(): PositionVo {
    return this.perspectiveManager.getCameraPosition();
  }

  public updateCameraPosition() {
    this.perspectiveManager.updateCameraPosition();
  }

  public getRoom(): RoomModel {
    return this.room;
  }

  public isMyPlayer(player: PlayerModel): boolean {
    return player.getId() === this.playerManager.getMyPlayerId();
  }

  public getMyPlayer(): PlayerModel {
    return this.playerManager.getMyPlayer();
  }

  public getPlayers(): PlayerModel[] {
    return this.playerManager.getPlayers();
  }

  public getOtherPlayers(): PlayerModel[] {
    return this.playerManager.getOtherPlayers();
  }

  public doesPosHavePlayers(pos: PositionVo): boolean {
    return !!this.playerManager.getPlayersAtPos(pos);
  }

  private updatePlayerPosition() {
    this.updatePlayerPositionTickCount += 1;

    const myPlayer = this.playerManager.getMyPlayer();
    const myPlayerAction = myPlayer.getAction();
    if (myPlayerAction.isStand()) {
      if (this.updatePlayerPositionTickCount % 10 === 0) {
        this.executeLocalCommand(ChangePlayerPrecisePositionCommand.create(myPlayer.getId(), myPlayer.getPrecisePosition()));
      }
    } else if (myPlayerAction.isWalk()) {
      const myPlayerDirection = myPlayer.getDirection();
      const myPlayerPrecisePosition = myPlayer.getPrecisePosition();

      const nextMyPlayerPrecisePosition = myPlayerPrecisePosition.shiftByDirection(myPlayerDirection, 5 / this.updatePlayerPositionTickFps);

      this.executeLocalCommand(ChangePlayerPrecisePositionCommand.create(myPlayer.getId(), nextMyPlayerPrecisePosition));
    }
  }

  private updatePlayerPositionTicker() {
    const frameDelay = 1000 / this.updatePlayerPositionTickFps;
    let lastFrameTime = 0;

    const animate = () => {
      const currentTime = performance.now();
      const elapsed = currentTime - lastFrameTime;
      if (elapsed > frameDelay) {
        this.updatePlayerPosition();
        lastFrameTime = currentTime - (elapsed % frameDelay);
      }
      this.animateId = requestAnimationFrame(animate);
    };
    animate();
  }

  subscribe(eventName: 'LOCAL_COMMAND_EXECUTED', subscriber: EventHandlerSubscriber<Command>): () => void;
  subscribe(eventName: 'CAMERA_POSITION_UPDATED', subscriber: EventHandlerSubscriber<PositionVo>): () => void;
  subscribe(eventName: 'PLAYER_ADDED', subscriber: EventHandlerSubscriber<PlayerModel>): () => void;
  subscribe(eventName: 'PLAYER_UPDATED', subscriber: EventHandlerSubscriber<[PlayerModel, PlayerModel]>): () => void;
  subscribe(eventName: 'MY_PLAYER_UPDATED', subscriber: EventHandlerSubscriber<[PlayerModel, PlayerModel]>): () => void;
  subscribe(eventName: 'MY_PLAYER_POSITION_UPDATED', subscriber: EventHandlerSubscriber<[PositionVo, PositionVo]>): () => void;
  subscribe(eventName: 'PLAYER_REMOVED', subscriber: EventHandlerSubscriber<PlayerModel>): () => void;
  public subscribe(
    eventName:
      | 'LOCAL_COMMAND_EXECUTED'
      | 'CAMERA_POSITION_UPDATED'
      | 'PLAYER_ADDED'
      | 'PLAYER_UPDATED'
      | 'MY_PLAYER_UPDATED'
      | 'MY_PLAYER_POSITION_UPDATED'
      | 'PLAYER_REMOVED',
    subscriber:
      | EventHandlerSubscriber<Command>
      | EventHandlerSubscriber<PositionVo>
      | EventHandlerSubscriber<PlayerModel>
      | EventHandlerSubscriber<[PlayerModel, PlayerModel]>
      | EventHandlerSubscriber<[PositionVo, PositionVo]>
      | EventHandlerSubscriber<void>
      | EventHandlerSubscriber<void>
  ): () => void {
    if (eventName === 'LOCAL_COMMAND_EXECUTED') {
      return this.commandManager.subscribeLocalCommandExecutedEvent(subscriber as EventHandlerSubscriber<Command>);
    } else if (eventName === 'CAMERA_POSITION_UPDATED') {
      return this.perspectiveManager.subscribePerspectiveChangedEvent(subscriber as EventHandlerSubscriber<PositionVo>);
    } else if (eventName === 'PLAYER_ADDED') {
      return this.playerManager.subscribePlayerAddedEvent(subscriber as EventHandlerSubscriber<PlayerModel>);
    } else if (eventName === 'PLAYER_UPDATED') {
      return this.playerManager.subscribePlayerUpdatedEvent(subscriber as EventHandlerSubscriber<[PlayerModel, PlayerModel]>);
    } else if (eventName === 'MY_PLAYER_UPDATED') {
      return this.playerManager.subscribeMyPlayerUpdatedEvent(subscriber as EventHandlerSubscriber<[PlayerModel, PlayerModel]>);
    } else if (eventName === 'MY_PLAYER_POSITION_UPDATED') {
      return this.playerManager.subscribeMyPlayerPositionUpdatedEvent(subscriber as EventHandlerSubscriber<[PositionVo, PositionVo]>);
    } else if (eventName === 'PLAYER_REMOVED') {
      return this.playerManager.subscribePlayerRemovedEvent(subscriber as EventHandlerSubscriber<PlayerModel>);
    } else {
      return () => {};
    }
  }
}
