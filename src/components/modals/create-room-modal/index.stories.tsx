import React from 'react';
import { StoryFn, Meta } from '@storybook/react';

import { CreateRoomModal } from '.';

export default {
  title: 'Modal/CreateRoomModal',
  component: CreateRoomModal,
  argTypes: {},
} as Meta<typeof CreateRoomModal>;

const Template: StoryFn<typeof CreateRoomModal> = function Template(args) {
  return <CreateRoomModal {...args} />;
};

export const Primary = Template.bind({});
Primary.args = {
  opened: true,
};
