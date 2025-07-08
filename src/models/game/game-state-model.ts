export abstract class GameStateModel<StateJson extends object = object> {
  abstract toJson(): StateJson;
  abstract isEnded(): boolean;
  abstract isPlayerInGame(playerId: string): boolean;
}
