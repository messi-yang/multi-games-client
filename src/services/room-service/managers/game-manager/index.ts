import { EventHandler, EventHandlerSubscriber } from '@/event-dispatchers/common/event-handler';
import { GameModel } from '@/models/game/game-model';

export class GameManager {
  private currentGame: GameModel;

  private currentGameUpdatedEventHandler = EventHandler.create<GameModel>();

  private newGameSetupEventHandler = EventHandler.create<GameModel>();

  private constructor(currentGame: GameModel) {
    this.currentGame = currentGame;
  }

  static create(game: GameModel) {
    return new GameManager(game);
  }

  public getCurrentGame(): GameModel {
    return this.currentGame;
  }

  public updateCurrentGameState(gameState: object) {
    const clonedCurrentGame = this.currentGame.clone();
    clonedCurrentGame.setState(gameState);
    this.updateCurrentGame(clonedCurrentGame);
    this.publishCurrentGameUpdatedEvent(clonedCurrentGame);
  }

  public updateCurrentGame(game: GameModel) {
    if (this.currentGame.getId() !== game.getId()) {
      throw new Error('Game ID mismatch');
    }

    this.currentGame = game;
    this.publishCurrentGameUpdatedEvent(game);
  }

  public setupNewGame(game: GameModel) {
    this.currentGame = game;
    this.publishNewGameSetupEvent(game);
  }

  private publishCurrentGameUpdatedEvent(game: GameModel) {
    this.currentGameUpdatedEventHandler.publish(game);
  }

  public subscribeCurrentGameUpdatedEvent(subscriber: EventHandlerSubscriber<GameModel>) {
    subscriber(this.getCurrentGame());
    return this.currentGameUpdatedEventHandler.subscribe(subscriber);
  }

  private publishNewGameSetupEvent(game: GameModel) {
    this.newGameSetupEventHandler.publish(game);
  }

  public subscribeNewGameSetupEvent(subscriber: EventHandlerSubscriber<GameModel>) {
    subscriber(this.getCurrentGame());
    return this.newGameSetupEventHandler.subscribe(subscriber);
  }
}
