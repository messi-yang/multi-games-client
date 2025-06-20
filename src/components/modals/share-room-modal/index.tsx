import { useMemo } from 'react';
import { Text } from '@/components/texts/text';
import { BaseModal } from '@/components/modals/base-modal';
import { dataTestids } from './data-test-ids';
import { RoomMemberModel } from '@/models/room-member-model';
import { RoomModel } from '@/models/room/room-model';
import { RoomMemberCard } from '@/components/cards/room-member-card';
import { Input } from '@/components/inputs/input';
import { Button } from '@/components/buttons/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

type Props = {
  opened: boolean;
  room: RoomModel;
  roomMembes: RoomMemberModel[] | null;
  onClose?: () => void;
};

export function ShareRoomModal({ opened, room, roomMembes, onClose }: Props) {
  const shareLink = useMemo(() => `${globalThis.location?.origin}/rooms/${room.getId()}`, [room]);
  const [copyToClipboard, isJustCopied] = useCopyToClipboard(shareLink);

  return (
    <BaseModal width={400} opened={opened} onBackgroundClick={onClose} onCrossClick={onClose}>
      <section
        data-testid={dataTestids.root}
        className="relative p-6 w-full h-full flex flex-col items-center border-4 border-solid border-white bg-[#121212]"
      >
        <div>
          <Text>Share Room</Text>
        </div>
        <div className="mt-5 w-full flex flex-row justify-between items-center">
          <div className="grow">
            <Input value={shareLink} disabled />
          </div>
          <div className="ml-2">
            <Button text={isJustCopied ? 'Copied' : 'Copy'} onClick={copyToClipboard} />
          </div>
        </div>
        {roomMembes && (
          <div className="mt-5 w-full flex flex-col">
            {roomMembes.map((roomMember) => (
              <div key={roomMember.getId()}>
                <RoomMemberCard roomMember={roomMember} />
              </div>
            ))}
          </div>
        )}
      </section>
    </BaseModal>
  );
}
