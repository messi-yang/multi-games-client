'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';

import { MyRoomsContext } from '@/contexts/my-rooms-context';
import { RoomCard } from '@/components/cards/room-card';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { RoomModel } from '@/models/game/room/room-model';
import { Button } from '@/components/buttons/button';
import { CreateRoomModal } from '@/components/modals/create-room-modal';
import { Text } from '@/components/texts/text';

const Page: NextPage = function Page() {
  const [isConfirmingRoomDeletion, setIsConfirmingRoomDeletion] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<RoomModel | null>(null);

  const { myRooms, getMyRooms, deleteRoomStatusMap, deleteRoom } = useContext(MyRoomsContext);

  useEffect(() => {
    getMyRooms();
  }, []);

  const handleDeleteRoomClick = useCallback((room: RoomModel) => {
    setIsConfirmingRoomDeletion(true);
    setRoomToDelete(room);
  }, []);

  const handleDeleteRoomConfirm = useCallback(() => {
    if (!roomToDelete) return;
    deleteRoom(roomToDelete.getId());
    setIsConfirmingRoomDeletion(false);
  }, [roomToDelete, deleteRoom]);

  const handleDeleteRoomCancel = useCallback(() => {
    setIsConfirmingRoomDeletion(false);
    setRoomToDelete(null);
  }, []);

  const { isCreatingRoom, createRoom } = useContext(MyRoomsContext);
  const [isCreateRoomModalOpened, setIsCreateRoomModalOpened] = useState(false);

  const handleCreateNewRoomClick = useCallback(() => {
    setIsCreateRoomModalOpened(true);
  }, []);

  const handleCreateRoomConfirm = useCallback(
    (roomName: string) => {
      createRoom(roomName);
      setIsCreateRoomModalOpened(false);
    },
    [createRoom]
  );

  const handleCreateRoomCancel = useCallback(() => {
    setIsCreateRoomModalOpened(false);
  }, []);

  return (
    <DashboardLayout
      panel={
        <div className="flex justify-end items-center">
          <Button text="Create Room" loading={isCreatingRoom} onClick={handleCreateNewRoomClick} />
        </div>
      }
    >
      <main className="flex gap-5 flex-col">
        <CreateRoomModal opened={isCreateRoomModalOpened} onConfirm={handleCreateRoomConfirm} onCancel={handleCreateRoomCancel} />
        <ConfirmModal
          opened={isConfirmingRoomDeletion}
          message={`Are you sure you want to delete room "${roomToDelete?.getName()}?"`}
          onComfirm={handleDeleteRoomConfirm}
          onCancel={handleDeleteRoomCancel}
        />
        <div className="rounded-3xl bg-stone-800 flex flex-col gap-5 p-6">
          <Text size="text-2xl" weight="font-bold">
            Recents
          </Text>
          <div className="flex flex-row gap-5">
            {myRooms?.slice(0, 4).map((room) => {
              if (deleteRoomStatusMap[room.getId()]) {
                return (
                  <div key={room.getId()} className="basis-64">
                    <RoomCard room={room} deleting />
                  </div>
                );
              }
              return (
                <Link key={room.getId()} href={`/rooms/${room.getId()}`} className="basis-64">
                  <RoomCard room={room} onDeleteClick={() => handleDeleteRoomClick(room)} />
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Page;
