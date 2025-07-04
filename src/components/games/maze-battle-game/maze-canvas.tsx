import { useEffect, useMemo, useRef, useState } from 'react';
import { Application, Sprite, Container, Assets, Texture, Graphics } from 'pixi.js';
import { CharacterVo } from '@/models/game/games/maze-battle/character-vo';
import { MazeVo } from '@/models/game/games/maze-battle/maze-vo';
import { WallVo } from '@/models/game/games/maze-battle/wall-vo';
import { ItemBoxVo } from '@/models/game/games/maze-battle/item-box-vo';

const CELL_SIZE = 20;

type Props = {
  maze: MazeVo;
  characters: CharacterVo[];
  itemBoxes: ItemBoxVo[];
};

export function MazeCanvas({ maze, characters, itemBoxes }: Props) {
  const [appContainerElem, setAppContainerElem] = useState<HTMLDivElement | null>(null);
  const [application, setApplication] = useState<Application | null>(null);

  const mazeWidth = useMemo(() => maze.getWidth() * CELL_SIZE, [maze]);
  const mazeHeight = useMemo(() => maze.getHeight() * CELL_SIZE, [maze]);

  useEffect(() => {
    if (!appContainerElem) return;
    if (application) return;

    const newApp = new Application();
    setApplication(newApp);

    newApp
      .init({
        background: 0x000000,
        width: mazeWidth,
        height: mazeHeight,
        antialias: true,
      })
      .then(() => {
        appContainerElem.appendChild(newApp.canvas);
      });
  }, [appContainerElem, application, mazeWidth, mazeHeight]);

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

  const [grassAsset, setGrassAsset] = useState<Texture | null>(null);
  useEffect(() => {
    if (grassAsset) return;
    Assets.load<Texture>('/assets/games/maze-battle/grass.png').then((asset) => {
      setGrassAsset(asset);
    });
  }, [application, grassAsset]);

  const [seceneContainer, setSeceneContainer] = useState<Container | null>(null);
  useEffect(() => {
    if (!application) return () => {};

    const newSeceneContainer = new Container();
    newSeceneContainer.zIndex = 0;
    setSeceneContainer(newSeceneContainer);
    application.stage.addChild(newSeceneContainer);

    return () => {
      application.stage.removeChild(newSeceneContainer);
    };
  }, [application]);

  useEffect(() => {
    if (!application) return () => {};
    if (!grassAsset) return () => {};

    const newGrassContainer = new Container();
    newGrassContainer.zIndex = -1;

    maze.iterateCells((position) => {
      const grassSprite = new Sprite(grassAsset);
      grassSprite.x = position.getX() * CELL_SIZE;
      grassSprite.y = position.getY() * CELL_SIZE;
      grassSprite.width = CELL_SIZE;
      grassSprite.height = CELL_SIZE;
      newGrassContainer.addChild(grassSprite);
    });

    application.stage.addChild(newGrassContainer);

    return () => {
      application.stage.removeChild(newGrassContainer);
    };
  }, [application, grassAsset]);

  const [mazeContainer, setMazeContainer] = useState<Container | null>(null);
  useEffect(() => {
    if (!seceneContainer) return () => {};

    const newMazeContainer = new Container();
    newMazeContainer.zIndex = 1;
    setMazeContainer(newMazeContainer);

    seceneContainer.addChild(newMazeContainer);

    return () => {
      seceneContainer.removeChild(newMazeContainer);
    };
  }, [seceneContainer]);

  useEffect(() => {
    if (!stoneAsset) return;
    if (!dirtAsset) return;
    if (!mazeContainer) return;

    maze.iterateCells((position, cell) => {
      if (cell instanceof WallVo) {
        const stoneSprite = new Sprite(stoneAsset);
        stoneSprite.x = position.getX() * CELL_SIZE;
        stoneSprite.y = position.getY() * CELL_SIZE;
        stoneSprite.width = CELL_SIZE;
        stoneSprite.height = CELL_SIZE;
        mazeContainer.addChild(stoneSprite);
      } else {
        const dirtSprite = new Sprite(dirtAsset);
        dirtSprite.x = position.getX() * CELL_SIZE;
        dirtSprite.y = position.getY() * CELL_SIZE;
        dirtSprite.width = CELL_SIZE;
        dirtSprite.height = CELL_SIZE;
        mazeContainer.addChild(dirtSprite);
      }
    });
  }, [maze, stoneAsset, dirtAsset, mazeContainer]);

  const characterContainerMapRef = useRef<Map<string, Container>>(new Map());
  const [charactersContainter, setCharactersContainter] = useState<Container | null>(null);
  useEffect(() => {
    if (!seceneContainer) return () => {};

    const newCharactersContainer = new Container();
    newCharactersContainer.zIndex = 3;
    setCharactersContainter(newCharactersContainer);
    seceneContainer.addChild(newCharactersContainer);

    return () => {
      seceneContainer.removeChild(newCharactersContainer);
    };
  }, [seceneContainer]);

  useEffect(() => {
    if (!charactersContainter) return;

    characters.forEach((character) => {
      const existingCharacterContainer = characterContainerMapRef.current.get(character.getId());
      if (existingCharacterContainer) {
        existingCharacterContainer.x = character.getPosition().getX() * CELL_SIZE;
        existingCharacterContainer.y = character.getPosition().getY() * CELL_SIZE;
        if (character.isReversed()) {
          existingCharacterContainer.pivot.set(CELL_SIZE, CELL_SIZE);
          existingCharacterContainer.rotation = Math.PI;
        } else {
          existingCharacterContainer.pivot.set(0, 0);
          existingCharacterContainer.rotation = 0;
        }
        return;
      }

      const characterContainer = new Container();
      characterContainer.width = CELL_SIZE;
      characterContainer.height = CELL_SIZE;
      characterContainer.x = character.getPosition().getX() * CELL_SIZE;
      characterContainer.y = character.getPosition().getY() * CELL_SIZE;
      if (character.isReversed()) {
        characterContainer.pivot.set(CELL_SIZE, CELL_SIZE);
        characterContainer.rotation = Math.PI;
      } else {
        characterContainer.pivot.set(0, 0);
        characterContainer.rotation = 0;
      }

      const characterCircle = new Graphics();
      characterCircle.beginFill(character.getColor(100), 0.8);
      characterCircle.drawRect(CELL_SIZE * 0.3, 0, CELL_SIZE * 0.4, CELL_SIZE * 0.2);
      characterCircle.drawRect(0, CELL_SIZE * 0.2, CELL_SIZE, CELL_SIZE * 0.8);
      characterCircle.endFill();

      characterContainerMapRef.current.set(character.getId(), characterContainer);
      characterContainer.addChild(characterCircle);
      charactersContainter.addChild(characterContainer);
    });

    characterContainerMapRef.current.forEach((characterContainer, characterId) => {
      if (!characters.some((character) => character.getId() === characterId)) {
        charactersContainter.removeChild(characterContainer);
        characterContainerMapRef.current.delete(characterId);
      }
    });
  }, [characters, charactersContainter]);

  const [itemBoxesContainer, setItemBoxesContainer] = useState<Container | null>(null);
  useEffect(() => {
    if (!seceneContainer) return () => {};

    const newItemBoxesContainer = new Container();
    newItemBoxesContainer.zIndex = 2;
    setItemBoxesContainer(newItemBoxesContainer);
    seceneContainer.addChild(newItemBoxesContainer);

    return () => {
      seceneContainer.removeChild(newItemBoxesContainer);
    };
  }, [seceneContainer]);

  const itemBoxObjectMapRef = useRef<Map<string, Sprite>>(new Map());
  useEffect(() => {
    if (!application) return;
    if (!itemBoxAsset) return;
    if (!mazeContainer) return;
    if (!itemBoxesContainer) return;

    itemBoxes.forEach((itemBox) => {
      const existingItemBoxObject = itemBoxObjectMapRef.current.get(itemBox.getPosition().toString());
      if (existingItemBoxObject) {
        existingItemBoxObject.x = itemBox.getPosition().getX() * CELL_SIZE;
        existingItemBoxObject.y = itemBox.getPosition().getY() * CELL_SIZE;
        return;
      }

      const itemBoxSprite = new Sprite(itemBoxAsset);
      itemBoxSprite.x = itemBox.getPosition().getX() * CELL_SIZE;
      itemBoxSprite.y = itemBox.getPosition().getY() * CELL_SIZE;
      itemBoxSprite.width = CELL_SIZE;
      itemBoxSprite.height = CELL_SIZE;
      itemBoxObjectMapRef.current.set(itemBox.getPosition().toString(), itemBoxSprite);
      itemBoxesContainer.addChild(itemBoxSprite);
    });

    itemBoxObjectMapRef.current.forEach((itemBoxObject, itemBoxPosition) => {
      if (!itemBoxes.some((itemBox) => itemBox.getPosition().toString() === itemBoxPosition)) {
        itemBoxesContainer.removeChild(itemBoxObject);
        itemBoxObjectMapRef.current.delete(itemBoxPosition);
      }
    });
  }, [application, itemBoxes, itemBoxAsset, mazeContainer, seceneContainer, itemBoxesContainer]);

  return <div className="w-full h-full flex items-center justify-center" ref={setAppContainerElem} />;
}
