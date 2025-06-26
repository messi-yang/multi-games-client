import { useEffect, useState } from 'react';
import { Application, Graphics } from 'pixi.js';
import { CharacterVo } from '@/models/game/games/maze-battle/character-vo';
import { MazeVo } from '@/models/game/games/maze-battle/maze-vo';
import { WallVo } from '@/models/game/games/maze-battle/wall-vo';

const CELL_SIZE = 10;

type Props = {
  maze: MazeVo;
  characters: CharacterVo[];
};

export function MazeCanvas({ maze, characters }: Props) {
  const [appContainerElem, setAppContainerElem] = useState<HTMLDivElement | null>(null);
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    if (!appContainerElem) return;
    if (application) return;

    const newApp = new Application();
    setApplication(newApp);

    newApp.init({ background: 0x000000, width: maze.getWidth() * 10, height: maze.getHeight() * 10 }).then(() => {
      appContainerElem.appendChild(newApp.canvas);
    });
  }, [appContainerElem, application, maze]);

  const [mazeContainer, setMazeContainer] = useState<Graphics | null>(null);
  useEffect(() => {
    if (!application) return;
    if (mazeContainer) return;

    const newMazeContainer = new Graphics();
    maze.iterateCells((position, cell) => {
      if (cell instanceof WallVo) {
        newMazeContainer.rect(position.getX() * CELL_SIZE, position.getY() * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        newMazeContainer.fill({ color: 0x303030 });
      } else {
        newMazeContainer.rect(position.getX() * CELL_SIZE, position.getY() * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        newMazeContainer.fill({ color: 0xffffff });
      }
    });
    application.stage.addChild(newMazeContainer);
    setMazeContainer(newMazeContainer);
  }, [application, maze, mazeContainer]);

  useEffect(() => {
    if (!application) return () => {};

    const charactersGraphics = new Graphics();
    characters.forEach((character) => {
      const position = character.getPosition();
      charactersGraphics.circle(position.getX() * 10 + 5, position.getY() * 10 + 5, 5);
      charactersGraphics.fill({ color: 0x00ffff });
    });

    application.stage.addChild(charactersGraphics);

    return () => {
      application.stage.removeChild(charactersGraphics);
    };
  }, [application, characters]);

  return <div className="w-full h-full flex items-center justify-center" ref={setAppContainerElem} />;
}
