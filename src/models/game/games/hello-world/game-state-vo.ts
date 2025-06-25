import { GameStateVo } from '../../game-state-vo';

type HelloWorldGameStateJson = {
  characters?: { id: string; count: number; name: string }[];
};

type Props = {
  characters: { id: string; count: number; name: string }[];
};

export class HelloWorldGameStateVo extends GameStateVo<HelloWorldGameStateJson> {
  private characters: { id: string; count: number; name: string }[];

  constructor(props: Props) {
    super();
    this.characters = props.characters;
  }

  static create(props: Props): HelloWorldGameStateVo {
    return new HelloWorldGameStateVo(props);
  }

  static fromJson(stateJson: HelloWorldGameStateJson): HelloWorldGameStateVo {
    return new HelloWorldGameStateVo({ characters: stateJson.characters ?? [] });
  }

  public toJson(): HelloWorldGameStateJson {
    return {
      characters: this.characters.map((character) => ({
        id: character.id,
        count: character.count,
        name: character.name,
      })),
    };
  }

  public getCharacters(): { id: string; count: number; name: string }[] {
    return this.characters;
  }

  public getCharacter(characterId: string): { id: string; count: number; name: string } | undefined {
    return this.characters.find((c) => c.id === characterId);
  }

  public addCharacterCount(characterId: string, count: number): HelloWorldGameStateVo {
    const clonedCharacters: { id: string; count: number; name: string }[] = JSON.parse(JSON.stringify(this.characters));
    const character = clonedCharacters.find((c: { id: string }) => c.id === characterId);
    if (character && character.count + 1 === count) {
      character.count = count;
    }
    return new HelloWorldGameStateVo({ characters: clonedCharacters });
  }

  public isEnded(): boolean {
    for (let i = 0; i < this.characters.length; i += 1) {
      const character = this.characters[i];
      if (character && character.count >= 200) {
        return true;
      }
    }
    return false;
  }

  public isPlayerInGame(playerId: string): boolean {
    return this.getCharacter(playerId) !== undefined;
  }
}
