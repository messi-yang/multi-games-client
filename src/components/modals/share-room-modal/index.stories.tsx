import React from 'react';
import { StoryFn, Meta } from '@storybook/react';

import { ShareRoomModal } from '.';
import { RoomMemberModel } from '@/models/room-member-model';
import { RoomModel } from '@/models/room/room-model';

export default {
  title: 'Modal/ShareRoomModal',
  component: ShareRoomModal,
  argTypes: {},
} as Meta<typeof ShareRoomModal>;

const Template: StoryFn<typeof ShareRoomModal> = function Template(args) {
  return <ShareRoomModal {...args} />;
};

export const Primary = Template.bind({});
Primary.args = {
  opened: true,
  room: RoomModel.createMock(),
  roomMembes: [RoomMemberModel.createMock(), RoomMemberModel.createMock(), RoomMemberModel.createMock()],
};
