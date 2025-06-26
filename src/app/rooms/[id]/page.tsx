'use client';

import { useEffect, useCallback, useRef, KeyboardEventHandler, useContext, useState, use } from 'react';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import { RoomServiceContext } from '@/contexts/room-service-context';
import { MessageModal } from '@/components/modals/message-modal';
import { AuthContext } from '@/contexts/auth-context';
import { RoomMembersContext } from '@/contexts/room-members-context';
import { Button } from '@/components/buttons/button';
import { ShareRoomModal } from '@/components/modals/share-room-modal';
import { MazeBattleGameBoard } from '@/components/games/maze-battle-game/board';
import { MazeBattleGameModel } from '@/models/game/games/maze-battle/game-model';
import { CommandModel } from '@/models/game/command-model';
import { MazeBattleGameRoom } from '@/components/games/maze-battle-game/room';
import { MazeBattleGameStateVo } from '@/models/game/games/maze-battle/game-state-vo';

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
  const {
    roomService,
    connectionStatus,
    players,
    myPlayerId,
    hostPlayerId,
    joinRoom,
    leaveRoom,
    currentGame,
    currentGameState,
    startGame,
    setupNewGame,
  } = useContext(RoomServiceContext);

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

  const handleCommand = useCallback(
    (command: CommandModel) => {
      if (!roomService) return;
      roomService.executeLocalCommand(command);
    },
    [roomService]
  );

  const handleRestart = useCallback(() => {
    if (!currentGame) return;
    setupNewGame(currentGame.getName());
  }, [currentGame, setupNewGame]);

  const handleStartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  return (
    <main className="relative w-full h-screen flex flex-col bg-black">
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
      <header className="flex justify-between items-center p-3">
        <section className="bg-black p-2 rounded-lg" role="button" tabIndex={0} onClick={handleLogoClick} onKeyDown={handleLogoKeyDown}>
          <Image src="/assets/images/logos/small-logo.png" alt="small logo" width={28} height={28} />
        </section>
        <Button text="Share" onClick={handleShareClick} />
      </header>
      <div className="relative flex flex-row gap-4 flex-1 overflow-hidden">
        <section ref={mapContainerRef} className="w-full h-full">
          {currentGame instanceof MazeBattleGameModel && myPlayerId && hostPlayerId && (
            <MazeBattleGameRoom myPlayerId={myPlayerId} hostPlayerId={hostPlayerId} players={players} onStartGame={handleStartGame} />
          )}
        </section>
        <section className={twMerge('absolute', 'top-0', currentGame?.hasStarted() ? 'left-0' : 'left-full', 'w-full', 'h-full', 'z-40')}>
          {currentGame instanceof MazeBattleGameModel &&
            currentGameState instanceof MazeBattleGameStateVo &&
            myPlayerId &&
            hostPlayerId &&
            currentGame.hasStarted() && (
              <MazeBattleGameBoard
                hostPlayerId={hostPlayerId}
                myPlayerId={myPlayerId}
                game={currentGame}
                gameState={currentGameState}
                onCommand={handleCommand}
                onRestart={handleRestart}
              />
            )}
        </section>
      </div>
    </main>
  );
};

export default Page;
