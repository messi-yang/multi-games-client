import { createContext, useCallback, useState, useMemo } from 'react';
import { RoomApi } from '@/adapters/apis/room-api';
import { RoomModel } from '@/models/room/room-model';
import { NotificationEventHandler } from '@/event-dispatchers/notification-event-handler';

type StatusMap = {
  [roomId: string]: boolean | undefined;
};

type ContextValue = {
  myRooms: RoomModel[] | null;
  getMyRooms: () => Promise<void>;

  isCreatingRoom: boolean;
  createRoom: (name: string) => Promise<void>;

  deleteRoomStatusMap: StatusMap;
  deleteRoom: (roomId: string) => Promise<void>;
};

function createInitialContextValue(): ContextValue {
  return {
    myRooms: null,
    getMyRooms: async () => {},

    isCreatingRoom: false,
    createRoom: async () => {},

    deleteRoomStatusMap: {},
    deleteRoom: async () => {},
  };
}

const Context = createContext<ContextValue>(createInitialContextValue());

type Props = {
  children: React.ReactNode;
};

function Provider({ children }: Props) {
  const [roomApi] = useState<RoomApi>(() => RoomApi.create());
  const initialContextValue = createInitialContextValue();
  const [myRooms, setMyRooms] = useState<RoomModel[] | null>(initialContextValue.myRooms);
  const notificationEventHandler = useMemo(() => NotificationEventHandler.create(), []);

  const getMyRooms = useCallback(async () => {
    const newMyRooms = await roomApi.getMyRooms();
    setMyRooms(newMyRooms);
  }, [roomApi]);

  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const createRoom = useCallback(
    async (name: string) => {
      setIsCreatingRoom(true);
      try {
        const newRoom = await roomApi.createRoom(name);
        setMyRooms((_myRooms) => [newRoom, ...(_myRooms || [])]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsCreatingRoom(false);
      }
    },
    [roomApi]
  );

  const [deleteRoomStatusMap, setDeleteRoomStatusMap] = useState<StatusMap>({});
  const deleteRoom = useCallback(
    async (roomId: string) => {
      setDeleteRoomStatusMap((prev) => {
        prev[roomId] = true;
        return prev;
      });

      const error = await roomApi.deleteRoom(roomId);
      if (error) {
        notificationEventHandler.publishErrorMessage(error.message);
      }

      setDeleteRoomStatusMap((prev) => {
        delete prev[roomId];
        return prev;
      });
    },
    [notificationEventHandler, roomApi]
  );

  const contextValue = useMemo<ContextValue>(
    () => ({
      myRooms,
      getMyRooms,
      isCreatingRoom,
      createRoom,
      deleteRoomStatusMap,
      deleteRoom,
    }),
    [myRooms, getMyRooms, isCreatingRoom, createRoom, deleteRoomStatusMap, deleteRoom]
  );

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

export { Provider as MyRoomsProvider, Context as MyRoomsContext };
