import classnames from 'classnames';
import { RoomModel } from '@/models/room/room-model';
import { Text } from '@/components/texts/text';
import { IconButton } from '@/components/buttons/icon-button';
import defaultImage from './default-image.jpg';
import { dataTestids } from './data-test-ids';

type Props = {
  room: RoomModel;
  deleting?: boolean;
  onDeleteClick?: () => void;
};

export function RoomCard({ room, deleting = false, onDeleteClick = () => {} }: Props) {
  return (
    <div
      data-testid={dataTestids.root}
      className={classnames(
        'w-full',
        'relative',
        'bg-black',
        deleting && 'opacity-30',
        'rounded-3xl',
        deleting && 'pointer-events-none',
        'overflow-hidden',
        'p-4',
        'pt-24',
        'object-contain'
      )}
      style={{
        backgroundImage: `url("${defaultImage.src}")`,
      }}
    >
      <div className={classnames('absolute', 'top-2', 'right-2', 'inline-flex')}>
        <IconButton iconName="material-symbols:close-rounded" onClick={onDeleteClick} />
      </div>
      <div className={classnames('flex', 'flex-col', 'p-3', 'bg-white', 'bg-opacity-30', 'rounded-xl')}>
        <Text size="text-lg" weight="font-bold">
          {room.getName()}
        </Text>
        <Text>{room.getEditedAtCopy()}</Text>
      </div>
    </div>
  );
}
