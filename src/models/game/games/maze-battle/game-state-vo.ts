import { GameStateVo } from '../../game-state-vo';
import { CharacterJson, CharacterVo } from './character-vo';
import { MazeJson, MazeVo } from './maze-vo';

type MazeBattleGameStateJson = {
  maze: MazeJson;
  characters: CharacterJson[];
};

type Props = {
  maze: MazeVo;
  characters: CharacterVo[];
};

export class MazeBattleGameStateVo extends GameStateVo<MazeBattleGameStateJson> {
  private maze: MazeVo;

  private characters: CharacterVo[];

  constructor(props: Props) {
    super();
    this.maze = props.maze;
    this.characters = props.characters;
  }

  static create(props: Props): MazeBattleGameStateVo {
    return new MazeBattleGameStateVo(props);
  }

  static fromJson(stateJson: MazeBattleGameStateJson | null): MazeBattleGameStateVo {
    if (!stateJson) {
      return MazeBattleGameStateVo.create({ maze: MazeVo.create({ width: 15, height: 15 }), characters: [] });
    }

    return new MazeBattleGameStateVo({
      maze: MazeVo.fromJson(stateJson.maze),
      characters: stateJson.characters.map((character) => CharacterVo.fromJson(character)),
    });
  }

  public toJson(): MazeBattleGameStateJson {
    return {
      maze: this.maze.toJson(),
      characters: this.characters.map((character) => character.toJson()),
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

  public updateCharacter(character: CharacterVo): MazeBattleGameStateVo {
    return MazeBattleGameStateVo.create({
      maze: this.maze,
      characters: this.characters.map((c) => (c.getId() === character.getId() ? character : c)),
    });
  }

  public isEnded(): boolean {
    return false;
  }
}
