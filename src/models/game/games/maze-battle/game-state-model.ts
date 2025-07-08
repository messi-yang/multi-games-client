import { GameStateModel } from '../../game-state-model';
import { CharacterJson, CharacterVo } from './character-vo';
import { MazeJson, MazeVo } from './maze-vo';
import { ItemBoxJson, ItemBoxVo } from './item-box-vo';
import { PositionVo } from './position-vo';
import { DateVo } from '@/models/global/date-vo';
import { EventHandler } from '@/event-dispatchers/common/event-handler';

const WAITING_TIME = 3;

export type MazeBattleGameStateJson = {
  maze: MazeJson;
  characters: CharacterJson[];
  itemBoxes: ItemBoxJson[];
  startedAt: string;
};

type Props = {
  maze: MazeVo;
  characters: CharacterVo[];
  itemBoxes: ItemBoxVo[];
  startedAt: DateVo;
};

export class MazeBattleGameStateModel extends GameStateModel<MazeBattleGameStateJson> {
  private maze: MazeVo;

  private characters: CharacterVo[];

  private itemBoxes: ItemBoxVo[];

  private startedAt: DateVo;

  private characterUpdatedEventHandler: EventHandler<CharacterVo> = new EventHandler();

  private itemBoxRemovedEventHandler: EventHandler<PositionVo> = new EventHandler();

  private countdownUpdatedEventHandler: EventHandler<number> = new EventHandler();

  private countdownInterval: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super();
    this.maze = props.maze;
    this.characters = props.characters;
    this.itemBoxes = props.itemBoxes;
    this.startedAt = props.startedAt;

    this.startCountdown();
  }

  static create(props: Props): MazeBattleGameStateModel {
    return new MazeBattleGameStateModel(props);
  }

  static createEmpty(): MazeBattleGameStateModel {
    return MazeBattleGameStateModel.create({
      maze: MazeVo.create({ width: 15, height: 15 }),
      characters: [],
      itemBoxes: [],
      startedAt: DateVo.now(),
    });
  }

  static fromJson(stateJson: MazeBattleGameStateJson): MazeBattleGameStateModel {
    return new MazeBattleGameStateModel({
      maze: MazeVo.fromJson(stateJson.maze),
      characters: stateJson.characters.map((character) => CharacterVo.fromJson(character)),
      itemBoxes: stateJson.itemBoxes.map((itemBox) => ItemBoxVo.fromJson(itemBox)),
      startedAt: DateVo.parseString(stateJson.startedAt),
    });
  }

  public toJson(): MazeBattleGameStateJson {
    return {
      maze: this.maze.toJson(),
      characters: this.characters.map((character) => character.toJson()),
      itemBoxes: this.itemBoxes.map((itemBox) => itemBox.toJson()),
      startedAt: this.startedAt.toString(),
    };
  }

  public getProps(): Props {
    return {
      maze: this.maze,
      characters: this.characters,
      itemBoxes: this.itemBoxes,
      startedAt: this.startedAt,
    };
  }

  public getMaze(): MazeVo {
    return this.maze;
  }

  public getCharacters(): CharacterVo[] {
    return this.characters;
  }

  public isPlayerInGame(playerId: string): boolean {
    return this.characters.some((character) => character.getId() === playerId);
  }

  public getCharacter(playerId: string): CharacterVo | null {
    return this.characters.find((character) => character.getId() === playerId) ?? null;
  }

  public getCharacterName(characterId: string): string | null {
    const character = this.getCharacter(characterId);
    if (!character) return null;
    return character.getName();
  }

  public updateCharacter(character: CharacterVo): void {
    this.characters = this.characters.map((c) => (c.getId() === character.getId() ? character : c));

    this.publishCharacterUpdatedEvent(character);
  }

  public getItemBoxAtPosition(position: PositionVo): ItemBoxVo | null {
    return this.itemBoxes.find((itemBox) => itemBox.getPosition().equals(position)) ?? null;
  }

  public getItemBoxes(): ItemBoxVo[] {
    return this.itemBoxes;
  }

  public addItemBox(itemBox: ItemBoxVo): void {
    this.itemBoxes.push(itemBox);
  }

  public removeItemBoxAtPosition(position: PositionVo): void {
    this.itemBoxes = this.itemBoxes.filter((itemBox) => !itemBox.getPosition().equals(position));

    this.publishItemBoxRemovedEvent(position);
  }

  public getStartedAt(): DateVo {
    return this.startedAt;
  }

  public getCountdown(): number {
    const countdown = this.startedAt.addSeconds(WAITING_TIME).getDiffInSeconds(DateVo.now());
    return Math.max(-1, countdown);
  }

  public isStarted(): boolean {
    return DateVo.now().getDiffInSeconds(this.startedAt) >= WAITING_TIME;
  }

  public isEnded(): boolean {
    return false;
  }

  public startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      if (this.isStarted()) {
        this.publishCountdownUpdatedEvent(this.getCountdown());
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
      } else {
        this.publishCountdownUpdatedEvent(this.getCountdown());
      }
    }, 100);
  }

  private publishCharacterUpdatedEvent(character: CharacterVo): void {
    this.characterUpdatedEventHandler.publish(character);
  }

  public subscribeCharacterUpdatedEvent(callback: (character: CharacterVo) => void): () => void {
    return this.characterUpdatedEventHandler.subscribe(callback);
  }

  private publishItemBoxRemovedEvent(position: PositionVo): void {
    this.itemBoxRemovedEventHandler.publish(position);
  }

  public subscribeItemBoxRemovedEvent(callback: (position: PositionVo) => void): () => void {
    return this.itemBoxRemovedEventHandler.subscribe(callback);
  }

  private publishCountdownUpdatedEvent(countdown: number): void {
    this.countdownUpdatedEventHandler.publish(countdown);
  }

  public subscribeCountdownUpdatedEvent(callback: (countdown: number) => void): () => void {
    return this.countdownUpdatedEventHandler.subscribe(callback);
  }
}
