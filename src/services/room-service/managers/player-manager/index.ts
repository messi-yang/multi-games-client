import { PlayerModel } from '@/models/player/player-model';

export class PlayerManager {
  private myPlayerId: string;

  private playerMap: Record<string, PlayerModel | undefined> = {};

  constructor(players: PlayerModel[], myPlayerId: string) {
    this.myPlayerId = myPlayerId;

    this.playerMap = {};
    players.forEach((player) => {
      this.updatePlayerInPlayerMap(player);
    });
  }

  static create(players: PlayerModel[], myPlayerId: string) {
    return new PlayerManager(players, myPlayerId);
  }

  public getPlayers(): PlayerModel[] {
    const players: PlayerModel[] = [];
    Object.values(this.playerMap).forEach((player) => {
      if (player) players.push(player);
    });
    return players;
  }

  public getMyPlayerId(): string {
    return this.myPlayerId;
  }

  public getMyPlayer(): PlayerModel {
    const myPlayer = this.playerMap[this.myPlayerId];
    if (!myPlayer) throw new Error('My player will never be undefined');

    return myPlayer;
  }

  public getOtherPlayers(): PlayerModel[] {
    const players: PlayerModel[] = [];
    Object.values(this.playerMap).forEach((player) => {
      if (player) players.push(player);
    });
    return players.filter((p) => p.getId() !== this.myPlayerId);
  }

  public getPlayer(playerId: string): PlayerModel | null {
    return this.playerMap[playerId] ?? null;
  }

  private addPlayerInPlayerMap(player: PlayerModel) {
    this.playerMap[player.getId()] = player;
  }

  private updatePlayerInPlayerMap(player: PlayerModel) {
    this.playerMap[player.getId()] = player;
  }

  private removePlayerFromPlayerMap(playerId: string) {
    delete this.playerMap[playerId];
  }

  /**
   * Add the player
   * @returns isStateChanged
   */
  public addPlayer(player: PlayerModel): boolean {
    if (this.getPlayer(player.getId())) return false;

    this.addPlayerInPlayerMap(player);

    return true;
  }

  /**
   * Update the player
   * @returns isStateChanged
   */
  public updatePlayer(player: PlayerModel): boolean {
    const oldPlayer = this.getPlayer(player.getId());
    if (!oldPlayer) return false;

    this.updatePlayerInPlayerMap(player);
    return true;
  }

  /**
   * Remove the player
   * @returns isStateChanged
   */
  public removePlayer(playerId: string): boolean {
    const currentPlayer = this.getPlayer(playerId);
    if (!currentPlayer) return false;

    this.removePlayerFromPlayerMap(playerId);

    return true;
  }
}
