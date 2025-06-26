import { EventHandler, EventHandlerSubscriber } from '@/event-dispatchers/common/event-handler';
import { PlayerModel } from '@/models/player/player-model';

export class PlayerManager {
  private myPlayerId: string;

  private hostPlayerId: string | null = null;

  private playerMap: Record<string, PlayerModel | undefined> = {};

  private hostPlayerIdUpdatedEventHandler = EventHandler.create<string | null>();

  private playersUpdatedEventHandler = EventHandler.create<PlayerModel[]>();

  private myPlayerUpdatedEventHandler = EventHandler.create<PlayerModel>();

  constructor(players: PlayerModel[], myPlayerId: string) {
    this.myPlayerId = myPlayerId;

    players.forEach((player) => {
      this.addPlayer(player);
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

  public getHostPlayerId(): string | null {
    return this.hostPlayerId;
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

  private findHostPlayer(): PlayerModel | null {
    const players = this.getPlayers();
    if (players.length === 0) return null;
    return players.sort((a, b) => a.getHostPriority() - b.getHostPriority())[0];
  }

  private updateHostPlayer() {
    const oldHostPlayerId = this.hostPlayerId;

    const hostPlayer = this.findHostPlayer();
    if (!hostPlayer) {
      this.hostPlayerId = null;
    } else {
      this.hostPlayerId = hostPlayer.getId();
    }

    if (oldHostPlayerId !== this.hostPlayerId) {
      this.publishHostPlayerIdUpdatedEvent(this.hostPlayerId);
    }
  }

  /**
   * Add the player
   * @returns isStateChanged
   */
  public addPlayer(player: PlayerModel): boolean {
    if (this.getPlayer(player.getId())) return false;

    this.addPlayerInPlayerMap(player);
    this.publishPlayersUpdatedEvent();
    this.updateHostPlayer();

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
    this.publishPlayersUpdatedEvent();
    this.updateHostPlayer();

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
    this.publishPlayersUpdatedEvent();
    this.updateHostPlayer();

    return true;
  }

  public subscribePlayersUpdatedEvent(subscriber: EventHandlerSubscriber<PlayerModel[]>): () => void {
    subscriber(this.getPlayers());
    return this.playersUpdatedEventHandler.subscribe(subscriber);
  }

  private publishPlayersUpdatedEvent() {
    this.playersUpdatedEventHandler.publish(this.getPlayers());
  }

  public subscribeHostPlayerIdUpdatedEvent(subscriber: EventHandlerSubscriber<string | null>): () => void {
    subscriber(this.hostPlayerId);
    return this.hostPlayerIdUpdatedEventHandler.subscribe(subscriber);
  }

  private publishHostPlayerIdUpdatedEvent(hostPlayerId: string | null) {
    this.hostPlayerIdUpdatedEventHandler.publish(hostPlayerId);
  }

  public subscribeMyPlayerUpdatedEvent(subscriber: EventHandlerSubscriber<PlayerModel>): () => void {
    subscriber(this.getMyPlayer());
    return this.myPlayerUpdatedEventHandler.subscribe(subscriber);
  }
}
