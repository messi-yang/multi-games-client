import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { RoomModel } from '@/models/game/room/room-model';

import { RoomCard } from '.';

export default {
  title: 'Card/RoomCard',
  component: RoomCard,
  argTypes: {},
} as Meta<typeof RoomCard>;

const Template: StoryFn<typeof RoomCard> = function Template(args) {
  return (
    <div className="w-[200px] h-[200px] flex items-center justify-center">
      <RoomCard {...args} />
    </div>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  room: RoomModel.createMock(),
};
