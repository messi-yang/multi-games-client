import { render, RenderResult, screen } from '@testing-library/react';
import { dataTestids } from './data-test-ids';
import { ShareRoomModal } from '.';
import { RoomMemberModel } from '@/models/iam/room-member-model';
import { RoomModel } from '@/models/game/room/room-model';

function renderShareRoomModal(): RenderResult {
  return render(
    <ShareRoomModal
      opened
      room={RoomModel.createMock()}
      roomMembes={[RoomMemberModel.createMock(), RoomMemberModel.createMock(), RoomMemberModel.createMock()]}
    />
  );
}

describe('ShareRoomModal', () => {
  it('Should render component successfully.', () => {
    try {
      renderShareRoomModal();
      const wrapper = screen.getByTestId(dataTestids.root);
      expect(wrapper).toBeInTheDocument();
    } catch (e) {
      expect(true).toBe(false);
    }
  });
});
