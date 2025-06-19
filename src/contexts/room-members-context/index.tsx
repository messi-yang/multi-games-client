import { createContext, useCallback, useState, useMemo } from 'react';
import { RoomMemberApi } from '@/adapters/apis/room-member-api';
import { RoomMemberModel } from '@/models/iam/room-member-model';

type ContextValue = {
  getRoomMembers: (roomId: string) => Promise<void>;
  roomMembers: RoomMemberModel[] | null;
};

function createInitialContextValue(): ContextValue {
  return {
    getRoomMembers: async () => {},
    roomMembers: null,
  };
}

const Context = createContext<ContextValue>(createInitialContextValue());

type Props = {
  children: React.ReactNode;
};

function Provider({ children }: Props) {
  const [roomMemberApi] = useState<RoomMemberApi>(() => RoomMemberApi.create());
  const [roomMembers, setRoomMembers] = useState<RoomMemberModel[] | null>(null);

  const getRoomMembers = useCallback(async (roomId: string) => {
    const returnedRoomMembers = await roomMemberApi.getRoomMembers(roomId);
    setRoomMembers(returnedRoomMembers);
  }, []);

  return (
    <Context.Provider value={useMemo<ContextValue>(() => ({ getRoomMembers, roomMembers }), [getRoomMembers, roomMembers])}>
      {children}
    </Context.Provider>
  );
}

export { Provider as RoomMembersProvider, Context as RoomMembersContext };
