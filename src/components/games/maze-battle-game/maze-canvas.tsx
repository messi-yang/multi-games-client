import { useEffect, useState } from 'react';
import { Application, Sprite, Container, Assets, Texture, Graphics } from 'pixi.js';
import { CharacterVo } from '@/models/game/games/maze-battle/character-vo';
import { MazeVo } from '@/models/game/games/maze-battle/maze-vo';
import { WallVo } from '@/models/game/games/maze-battle/wall-vo';
import { ItemBoxVo } from '@/models/game/games/maze-battle/item-box-vo';

const CELL_SIZE = 12;

type Props = {
  maze: MazeVo;
  characters: CharacterVo[];
  itemBoxes: ItemBoxVo[];
};

export function MazeCanvas({ maze, characters, itemBoxes }: Props) {
  const [appContainerElem, setAppContainerElem] = useState<HTMLDivElement | null>(null);
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    if (!appContainerElem) return;
    if (application) return;

    const newApp = new Application();
    setApplication(newApp);

    newApp
      .init({
        background: 0x000000,
        width: maze.getWidth() * CELL_SIZE,
        height: maze.getHeight() * CELL_SIZE,
        antialias: true,
      })
      .then(() => {
        appContainerElem.appendChild(newApp.canvas);
      });
  }, [appContainerElem, application, maze]);

  const [stoneAsset, setStoneAsset] = useState<Texture | null>(null);
  useEffect(() => {
    if (stoneAsset) return;
    Assets.load<Texture>('/assets/games/maze-battle/stone.png').then((asset) => {
      setStoneAsset(asset);
    });
  }, [application, stoneAsset]);

  const [dirtAsset, setDirtAsset] = useState<Texture | null>(null);
  useEffect(() => {
    if (dirtAsset) return;
    Assets.load<Texture>('/assets/games/maze-battle/dirt.png').then((asset) => {
      setDirtAsset(asset);
    });
  }, [application, dirtAsset]);

  const [itemBoxAsset, setItemBoxAsset] = useState<Texture | null>(null);
  useEffect(() => {
    if (itemBoxAsset) return;
    Assets.load<Texture>('/assets/games/maze-battle/item-box.png').then((asset) => {
      setItemBoxAsset(asset);
    });
  }, [application, itemBoxAsset]);

  const [mazeContainer, setMazeContainer] = useState<Container | null>(null);
  useEffect(() => {
    if (!application) return;
    if (!stoneAsset) return;
    if (!dirtAsset) return;

    const newMazeContainer = new Container();

    maze.iterateCells((position, cell) => {
      if (cell instanceof WallVo) {
        const stoneSprite = new Sprite(stoneAsset);
        stoneSprite.x = position.getX() * CELL_SIZE;
        stoneSprite.y = position.getY() * CELL_SIZE;
        stoneSprite.width = CELL_SIZE;
        stoneSprite.height = CELL_SIZE;
        newMazeContainer.addChild(stoneSprite);
      } else {
        const dirtSprite = new Sprite(dirtAsset);
        dirtSprite.x = position.getX() * CELL_SIZE;
        dirtSprite.y = position.getY() * CELL_SIZE;
        dirtSprite.width = CELL_SIZE;
        dirtSprite.height = CELL_SIZE;
        newMazeContainer.addChild(dirtSprite);
      }
    });

    setMazeContainer(newMazeContainer);
    application.stage.addChild(newMazeContainer);
  }, [application, maze, stoneAsset, dirtAsset]);

  useEffect(() => {
    if (!application) return () => {};
    if (!mazeContainer) return () => {};

    const newCharactersContainer = new Container();

    characters.forEach((character) => {
      const characterCircle = new Graphics();
      characterCircle.beginFill(character.getColor());
      characterCircle.drawCircle(CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE / 2);
      characterCircle.endFill();
      characterCircle.x = character.getPosition().getX() * CELL_SIZE;
      characterCircle.y = character.getPosition().getY() * CELL_SIZE;
      newCharactersContainer.addChild(characterCircle);
    });

    application.stage.addChild(newCharactersContainer);

    return () => {
      application.stage.removeChild(newCharactersContainer);
    };
  }, [application, characters, mazeContainer]);

  useEffect(() => {
    if (!application) return () => {};
    if (!itemBoxAsset) return () => {};
    if (!mazeContainer) return () => {};

    const newItemBoxesContainer = new Container();

    itemBoxes.forEach((itemBox) => {
      const itemBoxSprite = new Sprite(itemBoxAsset);
      itemBoxSprite.x = itemBox.getPosition().getX() * CELL_SIZE;
      itemBoxSprite.y = itemBox.getPosition().getY() * CELL_SIZE;
      itemBoxSprite.width = CELL_SIZE;
      itemBoxSprite.height = CELL_SIZE;
      newItemBoxesContainer.addChild(itemBoxSprite);
    });

    application.stage.addChild(newItemBoxesContainer);

    return () => {
      application.stage.removeChild(newItemBoxesContainer);
    };
  }, [application, itemBoxes, itemBoxAsset, mazeContainer]);

  return <div className="w-full h-full flex items-center justify-center" ref={setAppContainerElem} />;
}
