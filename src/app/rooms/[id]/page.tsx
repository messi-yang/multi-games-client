'use client';

import { useEffect, useCallback, useRef, KeyboardEventHandler, useContext, useState, use } from 'react';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { useHotKeys } from '@/hooks/use-hot-keys';
import { RoomJourneyServiceContext } from '@/contexts/room-journey-service-context';
import { DirectionVo } from '@/models/game/common/direction-vo';
import { RoomCanvas } from '@/components/canvas/room-canvas';
import { MessageModal } from '@/components/modals/message-modal';
import { Text } from '@/components/texts/text';
import { AuthContext } from '@/contexts/auth-context';
import { RoomMembersContext } from '@/contexts/room-members-context';
import { Button } from '@/components/buttons/button';
import { ShareRoomModal } from '@/components/modals/share-room-modal';

const Page = function Page({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const roomId = id;

  const [isShareRoomModalVisible, setIsShareRoomModalVisible] = useState(false);
  const handleShareClick = useCallback(() => {
    setIsShareRoomModalVisible(true);
  }, []);
  const handleShareRoomModalClose = useCallback(() => {
    setIsShareRoomModalVisible(false);
  }, []);

  const { isSingedIn } = useContext(AuthContext);
  const { roomMembers, getRoomMembers } = useContext(RoomMembersContext);
  useEffect(() => {
    if (!isSingedIn || !roomId) return;

    getRoomMembers(roomId);
  }, [isSingedIn, roomId, getRoomMembers]);

  const mapContainerRef = useRef<HTMLElement | null>(null);
  const { roomJourneyService, connectionStatus, enterRoom, makePlayerStand, makePlayerWalk, leaveRoom } =
    useContext(RoomJourneyServiceContext);

  const [myPlayerPosText, setMyPlayerPosText] = useState<string | null>(null);
  useEffect(() => {
    if (!roomJourneyService) return () => {};

    return roomJourneyService.subscribe('MY_PLAYER_UPDATED', ([, player]) => {
      setMyPlayerPosText(player.getPosition().toText());
    });
  }, [roomJourneyService]);

  const isDisconnected = connectionStatus === 'DISCONNECTED';
  useEffect(() => {
    if (!isDisconnected) return () => {};

    const timeout = setTimeout(() => {
      window.location.href = '/dashboard/rooms';
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isDisconnected]);

  useEffect(
    function enterRoomOnInit() {
      if (!roomId) {
        return () => {};
      }
      enterRoom(roomId);

      return () => {
        leaveRoom();
      };
    },
    [roomId]
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

  const goToDashboardRoomsPage = () => {
    router.push('/dashboard/rooms');
  };
  const handleLogoClick = () => {
    goToDashboardRoomsPage();
  };
  const handleLogoKeyDown: KeyboardEventHandler<HTMLElement> = (evt) => {
    if (evt.code === 'Enter') {
      goToDashboardRoomsPage();
    }
  };

  const handleRecconectModalConfirmClick = useCallback(() => {
    if (roomId) {
      enterRoom(roomId);
    }
  }, [enterRoom, roomId]);

  return (
    <main className="relative w-full h-screen">
      <MessageModal
        opened={isDisconnected}
        message="You're disconnected to the room."
        buttonCopy="Reconnect"
        onComfirm={handleRecconectModalConfirmClick}
      />
      {roomJourneyService && (
        <ShareRoomModal
          opened={isShareRoomModalVisible}
          room={roomJourneyService.getRoom()}
          roomMembes={roomMembers}
          onClose={handleShareRoomModalClose}
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
        <section className="w-full h-full">{roomJourneyService && <RoomCanvas roomJourneyService={roomJourneyService} />}</section>
      </section>
    </main>
  );
};

export default Page;
