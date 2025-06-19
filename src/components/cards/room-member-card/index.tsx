import classnames from 'classnames';
import { RoomMemberModel } from '@/models/iam/room-member-model';
import { Text } from '@/components/texts/text';
import { dataTestids } from './data-test-ids';
import { UserAvatar } from '@/components/avatars/user-avatar';

type Props = {
  roomMember: RoomMemberModel;
};

export function RoomMemberCard({ roomMember }: Props) {
  return (
    <div data-testid={dataTestids.root} className={classnames('relative', 'w-full', 'p-2', 'flex', 'flex-row', 'items-center')}>
      <div className="grow flex flex-row items-center">
        <UserAvatar size="small" user={roomMember.getUser()} />
        <div className="ml-2">
          <Text>{roomMember.getUser().getUsername()}</Text>
        </div>
      </div>
      <div className="ml-2">
        <Text>{roomMember.getRoomRole().toString()}</Text>
      </div>
    </div>
  );
}
