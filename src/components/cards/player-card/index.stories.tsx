import React from 'react';
import { StoryFn, Meta } from '@storybook/react';

import { PlayerCard } from '.';
import { PlayerModel } from '@/models/player/player-model';

export default {
  title: 'Card/PlayerCard',
  component: PlayerCard,
  argTypes: {},
} as Meta<typeof PlayerCard>;

const Template: StoryFn<typeof PlayerCard> = function Template(args) {
  return (
    <div className="w-[400px] h-[200px] flex items-center justify-center">
      <PlayerCard {...args} />
    </div>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  player: PlayerModel.createMock(),
};
