import { DateVo } from '@/models/global/date-vo';
import { GameModel } from '../../game-model';
import { GameNameEnum } from '../../game-name-enum';
import { PlayerModel } from '@/models/player/player-model';
import { MazeBattleGameStateModel } from './game-state-model';
import { CharacterVo } from './character-vo';
import { MazeVo } from './maze-vo';
import { getRandomColors } from './utils';
import { ItemBoxVo } from './item-box-vo';
import { createRandomItem } from './items/utils';

type Props = {
  id: string;
  roomId: string;
  name: GameNameEnum;
  started: boolean;
  state: MazeBattleGameStateModel;
  createdAt: DateVo;
  updatedAt: DateVo;
};

export class MazeBattleGameModel extends GameModel<MazeBattleGameStateModel> {
  private constructor(props: Props) {
    super(props);
  }

  static create(props: Props): MazeBattleGameModel {
    return new MazeBattleGameModel(props);
  }

  public clone(): MazeBattleGameModel {
    return new MazeBattleGameModel({
      id: this.id,
      roomId: this.roomId,
      name: this.name,
      started: this.started,
      state: this.state,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  public generateInitialState(players: PlayerModel[]): MazeBattleGameStateModel {
    const maze = MazeVo.create({ width: 51, height: 51 });
    const characters: CharacterVo[] = [];

    const randomColors = getRandomColors(players.length);

    for (let i = 0; i < players.length; i += 1) {
      const player = players[i];
      characters.push(
        CharacterVo.create({
          id: player.getId(),
          name: player.getName(),
          position: maze.getStartPosition(),
          reachedGoadAt: null,
          color: randomColors[i],
          heldItems: [],
          reversed: false,
        })
      );
    }

    const randomRoadPositions = maze.getRandomRoadPositions(30);
    const itemBoxes: ItemBoxVo[] = [];
    for (let i = 0; i < randomRoadPositions.length; i += 1) {
      const item = createRandomItem();
      const position = randomRoadPositions[i];
      const itemBox = ItemBoxVo.create({ item, position });
      itemBoxes.push(itemBox);
    }

    return MazeBattleGameStateModel.create({ maze, characters, itemBoxes, startedAt: DateVo.now() });
  }

  public isPlayerInGame(playerId: string): boolean {
    if (!this.state) {
      return false;
    }
    return this.state.isPlayerInGame(playerId);
  }

  public isEnded(): boolean {
    const currentState = this.state;
    if (!currentState) {
      return false;
    }
    const characters = currentState.getCharacters();
    return characters.every((character) => character.getReachedGoadAt() !== null);
  }
}
