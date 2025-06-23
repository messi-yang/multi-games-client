import { PlayerModel } from '@/models/player/player-model';
import { RoomModel } from '@/models/room/room-model';
import { PlayerManager } from './managers/player-manager';
import { GameManager } from './managers/game-manager';
import { EventHandlerSubscriber } from '../../event-dispatchers/common/event-handler';
import { GameModel } from '@/models/game/game-model';
import { RoomManager } from './managers/room-manager';
import { CommandModel } from '@/models/game/command-model';

export class RoomService {
  private roomManager: RoomManager;

  private playerManager: PlayerManager;

  private gameManager: GameManager;

  private constructor(room: RoomModel, game: GameModel, commands: CommandModel[], players: PlayerModel[], myPlayerId: string) {
    this.roomManager = RoomManager.create(room);

    this.playerManager = PlayerManager.create(players, myPlayerId);

    this.gameManager = GameManager.create(game);

    commands.forEach((command) => this.gameManager.executeRemoteCommand(command));
  }

  static create(room: RoomModel, game: GameModel, commands: CommandModel[], players: PlayerModel[], myPlayerId: string) {
    return new RoomService(room, game, commands, players, myPlayerId);
  }

  public removeFailedCommand(commandId: string) {
    this.gameManager.removeFailedCommand(commandId);
  }

  /**
   * Replays commands executed within the specified duration.
   * @param duration miliseconds
   * @param speed 1 is normal speed
   */
  public replayCommands(duration: number, speed: number) {
    this.gameManager.replayCommands(duration, speed);
  }

  public executeRemoteCommand(command: CommandModel) {
    this.gameManager.executeRemoteCommand(command);
  }

  public executeLocalCommand(command: CommandModel) {
    this.gameManager.executeLocalCommand(command);
  }

  public getRoom(): RoomModel {
    return this.roomManager.getRoom();
  }

  public getCurrentGame(): GameModel {
    return this.gameManager.getCurrentGame();
  }

  public startGame(game: GameModel) {
    this.gameManager.startGame(game);
  }

  public setupNewGame(game: GameModel) {
    this.gameManager.setupNewGame(game);
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

  subscribe(eventName: 'LOCAL_COMMAND_EXECUTED', subscriber: EventHandlerSubscriber<CommandModel>): () => void;
  subscribe(eventName: 'CURRENT_GAME_UPDATED', subscriber: EventHandlerSubscriber<GameModel>): () => void;
  subscribe(eventName: 'NEW_GAME_SETUP', subscriber: EventHandlerSubscriber<GameModel>): () => void;
  subscribe(eventName: 'PLAYERS_UPDATED', subscriber: EventHandlerSubscriber<PlayerModel[]>): () => void;
  subscribe(eventName: 'HOST_PLAYER_ID_UPDATED', subscriber: EventHandlerSubscriber<string | null>): () => void;
  subscribe(eventName: 'MY_PLAYER_ID_UPDATED', subscriber: EventHandlerSubscriber<string>): () => void;
  public subscribe(
    eventName:
      | 'LOCAL_COMMAND_EXECUTED'
      | 'CURRENT_GAME_UPDATED'
      | 'NEW_GAME_SETUP'
      | 'PLAYERS_UPDATED'
      | 'HOST_PLAYER_ID_UPDATED'
      | 'MY_PLAYER_ID_UPDATED',
    subscriber:
      | EventHandlerSubscriber<CommandModel>
      | EventHandlerSubscriber<GameModel>
      | EventHandlerSubscriber<PlayerModel[]>
      | EventHandlerSubscriber<string | null>
      | EventHandlerSubscriber<string>
  ): () => void {
    if (eventName === 'LOCAL_COMMAND_EXECUTED') {
      return this.gameManager.subscribeLocalCommandExecutedEvent(subscriber as EventHandlerSubscriber<CommandModel>);
    } else if (eventName === 'CURRENT_GAME_UPDATED') {
      return this.gameManager.subscribeCurrentGameUpdatedEvent(subscriber as EventHandlerSubscriber<GameModel>);
    } else if (eventName === 'NEW_GAME_SETUP') {
      return this.gameManager.subscribeNewGameSetupEvent(subscriber as EventHandlerSubscriber<GameModel>);
    } else if (eventName === 'PLAYERS_UPDATED') {
      return this.playerManager.subscribePlayersUpdatedEvent(subscriber as EventHandlerSubscriber<PlayerModel[]>);
    } else if (eventName === 'HOST_PLAYER_ID_UPDATED') {
      return this.playerManager.subscribeHostPlayerIdUpdatedEvent(subscriber as EventHandlerSubscriber<string | null>);
    } else if (eventName === 'MY_PLAYER_ID_UPDATED') {
      return this.playerManager.subscribeMyPlayerIdUpdatedEvent(subscriber as EventHandlerSubscriber<string>);
    } else {
      return () => {};
    }
  }
}
