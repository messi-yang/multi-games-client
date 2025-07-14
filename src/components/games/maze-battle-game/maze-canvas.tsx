import { useCallback, useEffect, useRef, useState } from 'react';
import { Application, Sprite, Container, Assets, Texture, Graphics } from 'pixi.js';
import { WallVo } from '@/models/game/games/maze-battle/wall-vo';
import { Text } from '@/components/texts/text';
import { MazeBattleGameStateModel } from '@/models/game/games/maze-battle/game-state-model';

const CELL_SIZE = 14;

type Props = {
  myPlayerId: string | null;
  gameState: MazeBattleGameStateModel;
};

export function MazeCanvas({ myPlayerId, gameState }: Props) {
  const [appContainerElem, setAppContainerElem] = useState<HTMLDivElement | null>(null);
  const [application, setApplication] = useState<Application | null>(null);

  const [countdown, setCountdown] = useState<number>(gameState.getCountdown());

  useEffect(() => {
    setCountdown(gameState.getCountdown());
    return gameState.subscribeCountdownUpdatedEvent((newCountdown) => {
      setCountdown(newCountdown);
    });
  }, [gameState]);

  // Initialize Pixi.js application
  useEffect(() => {
    if (!appContainerElem) return;

    const newApplication = new Application();

    newApplication
      .init({
        background: 0x000000,
        antialias: true,
      })
      .then(() => {
        setApplication(newApplication);
        appContainerElem.appendChild(newApplication.canvas);
      });
  }, [appContainerElem]);

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

  const [maskAsset, setMaskAsset] = useState<Texture | null>(null);
  useEffect(() => {
    if (maskAsset) return;
    Assets.load<Texture>('/assets/games/maze-battle/mask.png').then((asset) => {
      setMaskAsset(asset);
    });
  }, [application, maskAsset]);

  const [seceneContainer, setSeceneContainer] = useState<Container | null>(null);

  // Initialize scene container
  useEffect(() => {
    if (!application) return;

    const newSeceneContainer = new Container();
    newSeceneContainer.zIndex = 0;
    application.stage.addChild(newSeceneContainer);
    setSeceneContainer(newSeceneContainer);
  }, [application, gameState]);

  // Resize renderer when game state changes
  useEffect(() => {
    if (!application) return;

    const maze = gameState.getMaze();
    const mazeWidth = maze.getWidth() * CELL_SIZE;
    const mazeHeight = maze.getHeight() * CELL_SIZE;
    application.renderer.resize(mazeWidth, mazeHeight);
  }, [application, gameState]);

  // Render grass
  useEffect(() => {
    if (!application || !grassAsset) return () => {};

    const newGrassContainer = new Container();
    newGrassContainer.zIndex = -1;
    application.stage.addChild(newGrassContainer);

    const maze = gameState.getMaze();

    maze.iterateCells((position) => {
      const grassSprite = new Sprite(grassAsset);
      grassSprite.x = position.getX() * CELL_SIZE;
      grassSprite.y = position.getY() * CELL_SIZE;
      grassSprite.width = CELL_SIZE;
      grassSprite.height = CELL_SIZE;
      newGrassContainer.addChild(grassSprite);
    });

    return () => {
      application.stage.removeChild(newGrassContainer);
    };
  }, [application, grassAsset, gameState]);

  // Rerender maze when game state changes
  useEffect(() => {
    if (!stoneAsset || !dirtAsset || !seceneContainer) return () => {};

    const newMazeContainer = new Container();
    newMazeContainer.zIndex = 1;

    const maze = gameState.getMaze();

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
    seceneContainer.addChild(newMazeContainer);

    return () => {
      seceneContainer.removeChild(newMazeContainer);
    };
  }, [gameState, stoneAsset, dirtAsset, seceneContainer]);

  const characterContainerMapRef = useRef<Map<string, Container>>(new Map());
  useEffect(() => {
    if (!seceneContainer) return () => {};

    const characters = gameState.getCharacters();

    const newCharactersContainer = new Container();
    newCharactersContainer.zIndex = 3;
    seceneContainer.addChild(newCharactersContainer);

    characters.forEach((character) => {
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
      newCharactersContainer.addChild(characterContainer);
    });

    return () => {
      characterContainerMapRef.current.forEach((characterContainer) => {
        newCharactersContainer.removeChild(characterContainer);
        characterContainer.destroy();
      });
      characterContainerMapRef.current.clear();

      seceneContainer.removeChild(newCharactersContainer);
    };
  }, [seceneContainer, gameState]);

  useEffect(() => {
    return gameState.subscribeCharacterUpdatedEvent((character) => {
      const characterContainer = characterContainerMapRef.current.get(character.getId());
      if (!characterContainer) return;

      characterContainer.x = character.getPosition().getX() * CELL_SIZE;
      characterContainer.y = character.getPosition().getY() * CELL_SIZE;
      if (character.isReversed()) {
        characterContainer.pivot.set(CELL_SIZE, CELL_SIZE);
        characterContainer.rotation = Math.PI;
      } else {
        characterContainer.pivot.set(0, 0);
        characterContainer.rotation = 0;
      }
    });
  }, [gameState]);

  const [itemBoxesContainer, setItemBoxesContainer] = useState<Container | null>(null);
  const itemBoxObjectMapRef = useRef<Map<string, Sprite>>(new Map());
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

  useEffect(() => {
    if (!itemBoxAsset || !itemBoxesContainer) return () => {};

    const itemBoxes = gameState.getItemBoxes();

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

    return () => {
      itemBoxObjectMapRef.current.forEach((itemBoxObject) => {
        itemBoxesContainer.removeChild(itemBoxObject);
        itemBoxObject.destroy();
      });
      itemBoxObjectMapRef.current.clear();
    };
  }, [itemBoxAsset, itemBoxesContainer, gameState]);

  useEffect(() => {
    return gameState.subscribeItemBoxRemovedEvent((position) => {
      const itemBoxObject = itemBoxObjectMapRef.current.get(position.toString());
      if (!itemBoxObject) return;

      itemBoxObject.destroy();
      itemBoxObjectMapRef.current.delete(position.toString());
    });
  }, [gameState]);

  // Render mask
  const [maskContainer, setMaskContainer] = useState<Container | null>(null);
  useEffect(() => {
    if (!seceneContainer || !maskAsset) return () => {};

    const maze = gameState.getMaze();
    const mazeWidth = maze.getWidth() * CELL_SIZE;
    const mazeHeight = maze.getHeight() * CELL_SIZE;

    const newMaskContainer = new Container();
    newMaskContainer.zIndex = 4;
    newMaskContainer.alpha = 0;

    const maskSprite = new Sprite(maskAsset);
    maskSprite.x = -CELL_SIZE * 5;
    maskSprite.y = -CELL_SIZE * 5;
    maskSprite.width = CELL_SIZE * 10;
    maskSprite.height = CELL_SIZE * 10;
    newMaskContainer.addChild(maskSprite);

    const leftMask = new Graphics();
    leftMask.beginFill(0x000000);
    leftMask.drawRect(
      -CELL_SIZE * 5 - CELL_SIZE * mazeWidth,
      -CELL_SIZE * 5 - CELL_SIZE * mazeHeight,
      CELL_SIZE * mazeWidth,
      2 * CELL_SIZE * mazeHeight
    );
    leftMask.endFill();
    newMaskContainer.addChild(leftMask);

    const rightMask = new Graphics();
    rightMask.beginFill(0x000000);
    rightMask.drawRect(5 * CELL_SIZE, -CELL_SIZE * 5 - CELL_SIZE * mazeHeight, CELL_SIZE * mazeWidth, 2 * CELL_SIZE * mazeHeight);
    rightMask.endFill();
    newMaskContainer.addChild(rightMask);

    const topMask = new Graphics();
    topMask.beginFill(0x000000);
    topMask.drawRect(-CELL_SIZE * 5, -CELL_SIZE * 5 - CELL_SIZE * mazeHeight, 10 * CELL_SIZE, CELL_SIZE * mazeHeight);
    topMask.endFill();
    newMaskContainer.addChild(topMask);

    const bottomMask = new Graphics();
    bottomMask.beginFill(0x000000);
    bottomMask.drawRect(-CELL_SIZE * 5, 5 * CELL_SIZE, 10 * CELL_SIZE, CELL_SIZE * mazeHeight);
    bottomMask.endFill();
    newMaskContainer.addChild(bottomMask);

    setMaskContainer(newMaskContainer);
    seceneContainer.addChild(newMaskContainer);

    return () => {
      seceneContainer.removeChild(newMaskContainer);
    };
  }, [seceneContainer, maskAsset]);

  const updateMask = useCallback(() => {
    if (!maskContainer || !myPlayerId) return;

    const myCharacter = gameState.getCharacter(myPlayerId);
    if (!myCharacter) return;

    const blindsMyPlayer = myCharacter.isBlinded() && !gameState.isEnded();

    maskContainer.x = myCharacter.getPosition().getX() * CELL_SIZE;
    maskContainer.y = myCharacter.getPosition().getY() * CELL_SIZE;
    maskContainer.alpha = blindsMyPlayer ? 1 : 0;
  }, [maskContainer, myPlayerId, gameState]);

  useEffect(() => {
    updateMask();
    return gameState.subscribeCharacterUpdatedEvent((character) => {
      if (character.getId() === myPlayerId) {
        updateMask();
      }
    });
  }, [updateMask, gameState]);

  return (
    <div className="w-full h-full relative">
      {countdown > -1 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center">
          <Text size="text-4xl">{countdown === 0 ? 'GO!' : countdown}</Text>
        </div>
      )}
      <div className="w-full h-full flex items-center justify-center" ref={setAppContainerElem} />
    </div>
  );
}
