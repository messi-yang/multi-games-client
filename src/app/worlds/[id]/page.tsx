'use client';

import { useEffect, useCallback, useRef, KeyboardEventHandler, useContext, useState, use } from 'react';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { useHotKeys } from '@/hooks/use-hot-keys';
import { WorldJourneyServiceContext } from '@/contexts/world-journey-service-context';
import { DirectionVo } from '@/models/world/common/direction-vo';
import { WorldCanvas } from '@/components/canvas/world-canvas';
import { MessageModal } from '@/components/modals/message-modal';
import { Text } from '@/components/texts/text';
import { AuthContext } from '@/contexts/auth-context';
import { WorldMembersContext } from '@/contexts/world-members-context';
import { Button } from '@/components/buttons/button';
import { ShareWorldModal } from '@/components/modals/share-world-modal';

const Page = function Page({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const worldId = id;

  const [isShareWorldModalVisible, setIsShareWorldModalVisible] = useState(false);
  const handleShareClick = useCallback(() => {
    setIsShareWorldModalVisible(true);
  }, []);
  const handleShareWorldModalClose = useCallback(() => {
    setIsShareWorldModalVisible(false);
  }, []);

  const { isSingedIn } = useContext(AuthContext);
  const { worldMembers, getWorldMembers } = useContext(WorldMembersContext);
  useEffect(() => {
    if (!isSingedIn || !worldId) return;

    getWorldMembers(worldId);
  }, [isSingedIn, worldId, getWorldMembers]);

  const mapContainerRef = useRef<HTMLElement | null>(null);
  const { worldJourneyService, connectionStatus, enterWorld, makePlayerStand, makePlayerWalk, leaveWorld } =
    useContext(WorldJourneyServiceContext);

  const [myPlayerPosText, setMyPlayerPosText] = useState<string | null>(null);
  useEffect(() => {
    if (!worldJourneyService) return () => {};

    return worldJourneyService.subscribe('MY_PLAYER_UPDATED', ([, player]) => {
      setMyPlayerPosText(player.getPosition().toText());
    });
  }, [worldJourneyService]);

  const isDisconnected = connectionStatus === 'DISCONNECTED';
  useEffect(() => {
    if (!isDisconnected) return () => {};

    const timeout = setTimeout(() => {
      window.location.href = '/dashboard/worlds';
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isDisconnected]);

  useEffect(
    function enterWorldOnInit() {
      if (!worldId) {
        return () => {};
      }
      enterWorld(worldId);

      return () => {
        leaveWorld();
      };
    },
    [worldId]
  );

  const handleMakePlayerWalkPressedKeysChange = useCallback(
    (keys: string[]) => {
      const lastKey = keys[keys.length - 1] || null;
      switch (lastKey) {
        case 'ArrowUp':
          makePlayerWalk(DirectionVo.newUp());
          break;
        case 'ArrowRight':
          makePlayerWalk(DirectionVo.newRight());
          break;
        case 'ArrowDown':
          makePlayerWalk(DirectionVo.newDown());
          break;
        case 'ArrowLeft':
          makePlayerWalk(DirectionVo.newLeft());
          break;
        default:
          makePlayerStand();
      }
    },
    [makePlayerStand, makePlayerWalk]
  );
  useHotKeys(['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'], {
    onPressedKeysChange: handleMakePlayerWalkPressedKeysChange,
  });

  const goToDashboardWorldsPage = () => {
    router.push('/dashboard/worlds');
  };
  const handleLogoClick = () => {
    goToDashboardWorldsPage();
  };
  const handleLogoKeyDown: KeyboardEventHandler<HTMLElement> = (evt) => {
    if (evt.code === 'Enter') {
      goToDashboardWorldsPage();
    }
  };

  const handleRecconectModalConfirmClick = useCallback(() => {
    if (worldId) {
      enterWorld(worldId);
    }
  }, [enterWorld, worldId]);

  return (
    <main className="relative w-full h-screen">
      <MessageModal
        opened={isDisconnected}
        message="You're disconnected to the world."
        buttonCopy="Reconnect"
        onComfirm={handleRecconectModalConfirmClick}
      />
      {worldJourneyService && (
        <ShareWorldModal
          opened={isShareWorldModalVisible}
          world={worldJourneyService.getWorld()}
          worldMembes={worldMembers}
          onClose={handleShareWorldModalClose}
        />
      )}
      <div className="absolute top-2 right-3 z-10 flex items-center gap-2">
        <Button text="Share" onClick={handleShareClick} />
        <div className="min-w-24 flex justify-center">
          <Text size="text-xl">{myPlayerPosText}</Text>
        </div>
      </div>
      <section
        className="absolute top-2 left-2 z-10 bg-black p-2 rounded-lg"
        role="button"
        tabIndex={0}
        onClick={handleLogoClick}
        onKeyDown={handleLogoKeyDown}
      >
        <Image src="/assets/images/logos/small-logo.png" alt="small logo" width={28} height={28} />
      </section>
      <section ref={mapContainerRef} className="relative w-full h-full overflow-hidden bg-black">
        <section className="w-full h-full">{worldJourneyService && <WorldCanvas worldJourneyService={worldJourneyService} />}</section>
      </section>
    </main>
  );
};

export default Page;
