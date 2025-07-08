import { GameStateModel } from '../../game-state-model';
import { CharacterJson, CharacterVo } from './character-vo';
import { MazeJson, MazeVo } from './maze-vo';
import { ItemBoxJson, ItemBoxVo } from './item-box-vo';
import { PositionVo } from './position-vo';
import { DateVo } from '@/models/global/date-vo';

const WAITING_TIME = 10;

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

  constructor(props: Props) {
    super();
    this.maze = props.maze;
    this.characters = props.characters;
    this.itemBoxes = props.itemBoxes;
    this.startedAt = props.startedAt;
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

  public updateCharacter(character: CharacterVo): MazeBattleGameStateModel {
    return MazeBattleGameStateModel.create({
      ...this.getProps(),
      characters: this.characters.map((c) => (c.getId() === character.getId() ? character : c)),
    });
  }

  public getItemBoxAtPosition(position: PositionVo): ItemBoxVo | null {
    return this.itemBoxes.find((itemBox) => itemBox.getPosition().equals(position)) ?? null;
  }

  public getItemBoxes(): ItemBoxVo[] {
    return this.itemBoxes;
  }

  public removeItemBoxAtPosition(position: PositionVo): MazeBattleGameStateModel {
    return MazeBattleGameStateModel.create({
      ...this.getProps(),
      itemBoxes: this.itemBoxes.filter((itemBox) => !itemBox.getPosition().equals(position)),
    });
  }

  public getStartedAt(): DateVo {
    return this.startedAt;
  }

  public getCountdown(): number {
    return this.startedAt.addSeconds(WAITING_TIME).getDiffInSeconds(DateVo.now());
  }

  public isStarted(): boolean {
    return DateVo.now().getDiffInSeconds(this.startedAt) >= WAITING_TIME;
  }

  public isEnded(): boolean {
    return false;
  }
}
