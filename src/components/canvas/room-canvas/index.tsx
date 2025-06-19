import { useEffect, useMemo, useCallback, useState } from 'react';

import { useDomRect } from '@/hooks/use-dom-rect';

import { dataTestids } from './data-test-ids';
import { RoomJourneyService } from '@/services/room-journey-service';
import { RoomRenderer } from './room-renderer';

type Props = {
  roomJourneyService: RoomJourneyService;
};

export function RoomCanvas({ roomJourneyService }: Props): React.ReactNode {
  const [wrapperDom, setWrapperDom] = useState<HTMLDivElement | null>(null);
  const wrapperDomRect = useDomRect(wrapperDom);
  const roomRenderer = useMemo(() => RoomRenderer.create(), [roomJourneyService]);

  const updateCameraPosition = useCallback(() => {
    const myPlayerPrecisePosition = roomJourneyService.getMyPlayer().getPrecisePosition();
    const cameraPosition = roomJourneyService.getCameraPosition();

    roomRenderer.updateCameraPosition(myPlayerPrecisePosition.shift(cameraPosition), myPlayerPrecisePosition);
  }, [roomJourneyService, roomRenderer]);

  useEffect(() => {
    if (!wrapperDom) return () => {};

    roomRenderer.mount(wrapperDom);
    updateCameraPosition();

    return () => {
      if (!wrapperDom) return;

      roomRenderer.destroy(wrapperDom);
    };
  }, [roomRenderer, wrapperDom, updateCameraPosition]);

  useEffect(() => {
    roomRenderer.updateCanvasSize(wrapperDomRect?.width || 0, wrapperDomRect?.height || 0);
  }, [wrapperDomRect, roomRenderer]);

  const [hasDownloadedPlayerModel, setHasDownloadedPlayerModel] = useState(false);
  useEffect(() => {
    return roomRenderer.subscribePlayerModelDownloadedEvent(() => {
      setHasDownloadedPlayerModel(true);
    });
  }, [roomRenderer]);

  const [hasDownloadedFont, setHasDownloadedFont] = useState(false);
  useEffect(() => {
    return roomRenderer.subscribeDefaultFontDownloadedEvent(() => {
      setHasDownloadedFont(true);
    });
  }, [roomRenderer]);

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
        if (animateCount % 600 === 0) roomRenderer.printRendererInfomation();
        lastFrameTime = currentTime - (elapsed % frameDelay);
        roomRenderer.render();
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
  }, [roomRenderer]);

  useEffect(() => {
    return roomJourneyService.subscribe('PLAYER_ADDED', (player) => {
      roomRenderer.updatePlayer(player);
    });
  }, [roomJourneyService, roomRenderer]);

  useEffect(() => {
    return roomJourneyService.subscribe('PLAYER_REMOVED', (player) => {
      roomRenderer.removePlayer(player);
    });
  }, [roomJourneyService, roomRenderer]);

  useEffect(() => {
    return roomJourneyService.subscribe('PLAYER_UPDATED', ([, newPlayer]) => {
      roomRenderer.updatePlayer(newPlayer);

      updateCameraPosition();
    });
  }, [roomJourneyService, updateCameraPosition]);

  useEffect(() => {
    return roomJourneyService.subscribe('CAMERA_POSITION_UPDATED', () => {
      updateCameraPosition();
    });
  }, [roomJourneyService, updateCameraPosition]);

  useEffect(() => {
    if (!hasDownloadedPlayerModel || !hasDownloadedFont) return;

    const players = roomJourneyService.getPlayers();
    players.forEach((player) => {
      roomRenderer.updatePlayer(player);
    });
  }, [hasDownloadedPlayerModel, hasDownloadedFont, roomJourneyService, roomRenderer]);

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
