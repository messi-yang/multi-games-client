import { EventHandler, EventHandlerSubscriber } from '@/event-dispatchers/common/event-handler';
import { GameModel } from '@/models/game/game-model';

export class GameManager {
  private currentGame: GameModel<object>;

  private gameUpdatedEventHandler = EventHandler.create<GameModel<object>>();

  private constructor(currentGame: GameModel<object>) {
    this.currentGame = currentGame;
  }

  static create(game: GameModel<object>) {
    return new GameManager(game);
  }

  public getCurrentGame(): GameModel<object> {
    return this.currentGame;
  }

  public updateCurrentGameState(gameState: object) {
    const clonedCurrentGame = this.currentGame.clone();
    clonedCurrentGame.setState(gameState);
    this.updateCurrentGame(clonedCurrentGame);
    this.publishGameUpdatedEvent(clonedCurrentGame);
  }

  public updateCurrentGame(game: GameModel<object>) {
    this.currentGame = game;
    this.publishGameUpdatedEvent(game);
  }

  private publishGameUpdatedEvent(game: GameModel<object>) {
    this.gameUpdatedEventHandler.publish(game);
  }

  public subscribeGameUpdatedEvent(subscriber: EventHandlerSubscriber<GameModel<object>>) {
    return this.gameUpdatedEventHandler.subscribe(subscriber);
  }
}
