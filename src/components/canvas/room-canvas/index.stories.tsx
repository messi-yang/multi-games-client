import React from 'react';
import { StoryFn, Meta } from '@storybook/react';

import { RoomCanvas } from '.';

export default {
  title: 'Canvas/RoomCanvas',
  component: RoomCanvas,
  argTypes: {},
} as Meta<typeof RoomCanvas>;

const Template: StoryFn<typeof RoomCanvas> = function Template(args) {
  return (
    <div className="w-screen h-screen">
      <RoomCanvas {...args} />
    </div>
  );
};

export const Primary = Template.bind({});
Primary.args = {};
