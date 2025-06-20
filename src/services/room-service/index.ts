import { PlayerModel } from '@/models/player/player-model';
import { RoomModel } from '@/models/room/room-model';
import { PlayerManager } from './managers/player-manager';
import { CommandManager } from './managers/command-manager';
import { EventHandlerSubscriber } from '../../event-dispatchers/common/event-handler';
import { GameManager } from './managers/game-manager';
import { GameModel } from '@/models/game/game-model';
import { RoomManager } from './managers/room-manager';
import { CommandModel } from '@/models/game/command-model';

export class RoomService {
  private roomManager: RoomManager;

  private playerManager: PlayerManager;

  private gameManager: GameManager;

  private commandManager: CommandManager;

  private constructor(
    room: RoomModel,
    game: GameModel<object>,
    commands: CommandModel<object>[],
    players: PlayerModel[],
    myPlayerId: string
  ) {
    this.roomManager = RoomManager.create(room);

    this.gameManager = GameManager.create(game);

    this.playerManager = PlayerManager.create(players, myPlayerId);

    this.commandManager = CommandManager.create(this.roomManager, this.gameManager, this.playerManager);

    commands.forEach((command) => this.commandManager.executeRemoteCommand(command));
  }

  static create(room: RoomModel, game: GameModel<object>, commands: CommandModel<object>[], players: PlayerModel[], myPlayerId: string) {
    return new RoomService(room, game, commands, players, myPlayerId);
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

  public executeRemoteCommand(command: CommandModel<object>) {
    this.commandManager.executeRemoteCommand(command);
  }

  public executeLocalCommand(command: CommandModel<object>) {
    this.commandManager.executeLocalCommand(command);
  }

  public getRoom(): RoomModel {
    return this.roomManager.getRoom();
  }

  public getCurrentGame(): GameModel<object> {
    return this.gameManager.getCurrentGame();
  }

  public isMyPlayer(player: PlayerModel): boolean {
    return player.getId() === this.playerManager.getMyPlayerId();
  }

  public addPlayer(player: PlayerModel) {
    this.playerManager.addPlayer(player);
  }

  public removePlayer(playerId: string) {
    this.playerManager.removePlayer(playerId);
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

  subscribe(eventName: 'LOCAL_COMMAND_EXECUTED', subscriber: EventHandlerSubscriber<CommandModel<object>>): () => void;
  subscribe(eventName: 'GAME_UPDATED', subscriber: EventHandlerSubscriber<GameModel<object>>): () => void;
  public subscribe(
    eventName: 'LOCAL_COMMAND_EXECUTED' | 'GAME_UPDATED',
    subscriber:
      | EventHandlerSubscriber<CommandModel<object>>
      | EventHandlerSubscriber<GameModel<object>>
      | EventHandlerSubscriber<void>
      | EventHandlerSubscriber<void>
  ): () => void {
    if (eventName === 'LOCAL_COMMAND_EXECUTED') {
      return this.commandManager.subscribeLocalCommandExecutedEvent(subscriber as EventHandlerSubscriber<CommandModel<object>>);
    } else if (eventName === 'GAME_UPDATED') {
      return this.gameManager.subscribeGameUpdatedEvent(subscriber as EventHandlerSubscriber<GameModel<object>>);
    } else {
      return () => {};
    }
  }
}
