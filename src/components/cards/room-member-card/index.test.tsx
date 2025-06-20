import { render, RenderResult, screen } from '@testing-library/react';
import { RoomMemberModel } from '@/models/room-member-model';
import { dataTestids } from './data-test-ids';
import { RoomMemberCard } from '.';

function renderRoomMemberCard(): RenderResult {
  return render(<RoomMemberCard roomMember={RoomMemberModel.createMock()} />);
}

describe('RoomMemberCard', () => {
  it('Should render component successfully.', () => {
    try {
      renderRoomMemberCard();
      const wrapper = screen.getByTestId(dataTestids.root);
      expect(wrapper).toBeInTheDocument();
    } catch (e) {
      expect(true).toBe(false);
    }
  });
});
