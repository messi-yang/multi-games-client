import React from 'react';
import { StoryFn, Meta } from '@storybook/react';

import { RoomMemberCard } from '.';
import { RoomMemberModel } from '@/models/iam/room-member-model';

export default {
  title: 'Card/RoomMemberCard',
  component: RoomMemberCard,
  argTypes: {},
} as Meta<typeof RoomMemberCard>;

const Template: StoryFn<typeof RoomMemberCard> = function Template(args) {
  return (
    <div className="w-[400px] h-[200px] flex items-center justify-center">
      <RoomMemberCard {...args} />
    </div>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  roomMember: RoomMemberModel.createMock(),
};
