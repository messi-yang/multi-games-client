import classnames from 'classnames';
import { Text } from '@/components/texts/text';
import { dataTestids } from './data-test-ids';
import { PlayerModel } from '@/models/player/player-model';

type Props = {
  player: PlayerModel;
};

export function PlayerCard({ player }: Props) {
  return (
    <div data-testid={dataTestids.root} className={classnames('relative', 'w-full', 'p-2', 'flex', 'flex-row', 'items-center')}>
      <div className="grow flex flex-row items-center">
        <div className="ml-2">
          <Text>{player.getName()}</Text>
        </div>
      </div>
    </div>
  );
}
