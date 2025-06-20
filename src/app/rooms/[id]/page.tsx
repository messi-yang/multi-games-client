'use client';

import { useEffect, useCallback, useRef, KeyboardEventHandler, useContext, useState, use } from 'react';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { RoomServiceContext } from '@/contexts/room-service-context';
import { MessageModal } from '@/components/modals/message-modal';
import { AuthContext } from '@/contexts/auth-context';
import { RoomMembersContext } from '@/contexts/room-members-context';
import { Button } from '@/components/buttons/button';
import { ShareRoomModal } from '@/components/modals/share-room-modal';
import { PlayerCard } from '@/components/cards/player-card';
import { HelloWorldGameSayHelloCommand } from '@/models/game/games/hello-world/commands/hello-world-game-say-hello-commands';

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
  const { roomService, connectionStatus, players, joinRoom, leaveRoom } = useContext(RoomServiceContext);

  useEffect(() => {
    if (!roomService) return () => {};
    const unsubscribe = roomService.subscribe('GAME_UPDATED', (game) => {
      console.log('game state', game.getState());
    });

    return () => {
      unsubscribe();
    };
  }, [roomService]);

  useEffect(() => {
    if (!roomService) return () => {};
    const currentGame = roomService.getCurrentGame();
    const myPlayer = roomService.getMyPlayer();

    let count = 0;

    const interval = setInterval(() => {
      roomService.executeLocalCommand(HelloWorldGameSayHelloCommand.create(currentGame.getId(), myPlayer.getId(), count));
      count += 1;
    }, 1000);

    return () => clearInterval(interval);
  }, [roomService]);

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
    function joinRoomOnInit() {
      if (!roomId) {
        return () => {};
      }
      joinRoom(roomId);

      return () => {
        leaveRoom();
      };
    },
    [roomId]
  );

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
      joinRoom(roomId);
    }
  }, [joinRoom, roomId]);

  return (
    <main className="relative w-full h-screen">
      <MessageModal
        opened={isDisconnected}
        message="You're disconnected to the room."
        buttonCopy="Reconnect"
        onComfirm={handleRecconectModalConfirmClick}
      />
      {roomService && (
        <ShareRoomModal
          opened={isShareRoomModalVisible}
          room={roomService.getRoom()}
          roomMembes={roomMembers}
          onClose={handleShareRoomModalClose}
        />
      )}
      <div className="absolute top-2 right-3 z-10 flex items-center gap-2">
        <Button text="Share" onClick={handleShareClick} />
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
        <section className="w-full h-full pt-10">
          {players.map((player) => (
            <PlayerCard key={player.getId()} player={player} />
          ))}
        </section>
      </section>
    </main>
  );
};

export default Page;
