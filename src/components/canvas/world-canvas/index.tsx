import { useEffect, useMemo, useCallback, useState } from 'react';

import { useDomRect } from '@/hooks/use-dom-rect';

import { dataTestids } from './data-test-ids';
import { WorldJourneyService } from '@/services/world-journey-service';
import { WorldRenderer } from './world-renderer';

type Props = {
  worldJourneyService: WorldJourneyService;
};

export function WorldCanvas({ worldJourneyService }: Props): React.ReactNode {
  const [wrapperDom, setWrapperDom] = useState<HTMLDivElement | null>(null);
  const wrapperDomRect = useDomRect(wrapperDom);
  const worldRenderer = useMemo(() => WorldRenderer.create(), [worldJourneyService]);

  const updateCameraPosition = useCallback(() => {
    const myPlayerPrecisePosition = worldJourneyService.getMyPlayer().getPrecisePosition();
    const cameraPosition = worldJourneyService.getCameraPosition();

    worldRenderer.updateCameraPosition(myPlayerPrecisePosition.shift(cameraPosition), myPlayerPrecisePosition);
  }, [worldJourneyService, worldRenderer]);

  useEffect(() => {
    if (!wrapperDom) return () => {};

    worldRenderer.mount(wrapperDom);
    updateCameraPosition();

    return () => {
      if (!wrapperDom) return;

      worldRenderer.destroy(wrapperDom);
    };
  }, [worldRenderer, wrapperDom, updateCameraPosition]);

  useEffect(() => {
    worldRenderer.updateCanvasSize(wrapperDomRect?.width || 0, wrapperDomRect?.height || 0);
  }, [wrapperDomRect, worldRenderer]);

  const [hasDownloadedPlayerModel, setHasDownloadedPlayerModel] = useState(false);
  useEffect(() => {
    return worldRenderer.subscribePlayerModelDownloadedEvent(() => {
      setHasDownloadedPlayerModel(true);
    });
  }, [worldRenderer]);

  const [hasDownloadedFont, setHasDownloadedFont] = useState(false);
  useEffect(() => {
    return worldRenderer.subscribeDefaultFontDownloadedEvent(() => {
      setHasDownloadedFont(true);
    });
  }, [worldRenderer]);

  useEffect(() => {
    const maxFps = 60;
    const frameDelay = 1000 / maxFps;
    let lastFrameTime = 0;
    let animateCount = 0;
    let animateId: number | null = null;

    const animate = () => {
      const currentTime = performance.now();
      const elapsed = currentTime - lastFrameTime;
      if (elapsed > frameDelay) {
        if (animateCount % 600 === 0) worldRenderer.printRendererInfomation();
        lastFrameTime = currentTime - (elapsed % frameDelay);
        worldRenderer.render();
        animateCount += 1;
      }
      animateId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animateId) {
        cancelAnimationFrame(animateId);
      }
    };
  }, [worldRenderer]);

  useEffect(() => {
    return worldJourneyService.subscribe('PLAYER_ADDED', (player) => {
      worldRenderer.updatePlayer(player);
    });
  }, [worldJourneyService, worldRenderer]);

  useEffect(() => {
    return worldJourneyService.subscribe('PLAYER_REMOVED', (player) => {
      worldRenderer.removePlayer(player);
    });
  }, [worldJourneyService, worldRenderer]);

  useEffect(() => {
    return worldJourneyService.subscribe('PLAYER_UPDATED', ([, newPlayer]) => {
      worldRenderer.updatePlayer(newPlayer);

      updateCameraPosition();
    });
  }, [worldJourneyService, updateCameraPosition]);

  useEffect(() => {
    return worldJourneyService.subscribe('CAMERA_POSITION_UPDATED', () => {
      updateCameraPosition();
    });
  }, [worldJourneyService, updateCameraPosition]);

  useEffect(() => {
    if (!hasDownloadedPlayerModel || !hasDownloadedFont) return;

    const players = worldJourneyService.getPlayers();
    players.forEach((player) => {
      worldRenderer.updatePlayer(player);
    });
  }, [hasDownloadedPlayerModel, hasDownloadedFont, worldJourneyService, worldRenderer]);

  return (
    <div className="relative w-full h-full flex">
      <div
        data-testid={dataTestids.root}
        ref={(ref) => {
          setWrapperDom(ref);
        }}
        className="relative w-full h-full flex"
      />
    </div>
  );
}
