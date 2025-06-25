export abstract class GameStateVo<StateJson extends object = object> {
  abstract toJson(): StateJson;
  abstract isEnded(): boolean;
  abstract isPlayerInGame(playerId: string): boolean;
}
