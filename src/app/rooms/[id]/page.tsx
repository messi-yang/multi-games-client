'use client';

import { useEffect, useCallback, useRef, KeyboardEventHandler, useContext, useState, use, useMemo } from 'react';

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
import { PlayersBox } from '@/components/boxes/players-box';
import { JoinRoomModal } from '@/components/modals/join-room-modal';

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
    currentGame,
    currentGameState,
    messages,
    joinRoom,
    leaveRoom,
    startGame,
    setupNewGame,
    sendMessage,
  } = useContext(RoomServiceContext);

  const isWaiting = useMemo(() => connectionStatus === 'WAITING', [connectionStatus]);

  const isDisconnected = useMemo(() => connectionStatus === 'DISCONNECTED', [connectionStatus]);
  useEffect(() => {
    if (!isDisconnected) return () => {};

    const timeout = setTimeout(() => {
      window.location.href = '/dashboard/rooms';
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isDisconnected]);

  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

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

  const handleJoinRoom = useCallback(
    (playerName: string | null) => {
      if (roomId) {
        joinRoom(roomId, playerName);
      }
    },
    [joinRoom, roomId]
  );

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, [leaveRoom]);

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

  const handleSendMessage = useCallback(
    (message: string) => {
      sendMessage(message);
    },
    [sendMessage]
  );

  return (
    <main className="relative w-full h-screen flex flex-col bg-gradient-to-br from-[#4B79A1] to-[#283E51]">
      <JoinRoomModal opened={isWaiting} isSignedIn={isSingedIn} onComfirm={handleJoinRoom} />
      <MessageModal opened={isDisconnected} message="You're disconnected to the room." buttonCopy="Refresh" onComfirm={handleRefresh} />
      {roomService && (
        <ShareRoomModal
          opened={isShareRoomModalVisible}
          room={roomService.getRoom()}
          roomMembes={roomMembers}
          onClose={handleShareRoomModalClose}
        />
      )}
      <header className="flex justify-between items-center p-2 bg-white/5 backdrop-blur-[20px] border border-white/10">
        <section
          className="bg-white/10 backdrop-blur-[20px] p-1 rounded-2xl hover:bg-white/20 transition-all duration-200 border border-white/10"
          role="button"
          tabIndex={0}
          onClick={handleLogoClick}
          onKeyDown={handleLogoKeyDown}
        >
          <Image src="/assets/logo.png" alt="small logo" width={32} height={32} className="drop-shadow-lg" />
        </section>
        <section className="flex justify-center gap-2 shrink-0">
          {currentGame && myPlayerId === hostPlayerId && !currentGame.hasStarted() && (
            <Button text="Start Game" onClick={handleStartGame} />
          )}
          {currentGame && myPlayerId === hostPlayerId && currentGame.hasStarted() && <Button text="Restart Game" onClick={handleRestart} />}
        </section>
        <Button text="Share" onClick={handleShareClick} />
      </header>
      <div className="relative flex flex-row gap-6 flex-1 overflow-hidden p-4">
        <div className="flex flex-col gap-4 w-full">
          <section
            ref={mapContainerRef}
            className="overflow-hidden relative grow w-full h-full rounded-3xl bg-white/5 backdrop-blur-[20px] border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
          >
            <div className={twMerge(currentGame?.hasStarted() ? 'hidden' : 'flex', 'flex-col', 'h-full', 'w-full')}>
              {currentGame instanceof MazeBattleGameModel && <MazeBattleGameRoom />}
            </div>
            <section className={twMerge(currentGame?.hasStarted() ? 'flex' : 'hidden', 'w-full', 'h-full', 'z-40')}>
              {roomService &&
                currentGame instanceof MazeBattleGameModel &&
                currentGameState instanceof MazeBattleGameStateVo &&
                myPlayerId &&
                hostPlayerId &&
                currentGame.hasStarted() && (
                  <MazeBattleGameBoard
                    roomService={roomService}
                    myPlayerId={myPlayerId}
                    game={currentGame}
                    gameState={currentGameState}
                    onCommand={handleCommand}
                  />
                )}
            </section>
          </section>
        </div>
        <section className="w-80 h-full rounded-3xl">
          {currentGame && myPlayerId && hostPlayerId && (
            <PlayersBox
              myPlayerId={myPlayerId}
              hostPlayerId={hostPlayerId}
              game={currentGame}
              players={players}
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          )}
        </section>
      </div>
    </main>
  );
};

export default Page;
