import { render, RenderResult, screen } from '@testing-library/react';
import { RoomModel } from '@/models/room/room-model';
import { dataTestids } from './data-test-ids';
import { RoomCard } from '.';

function renderRoomCard(): RenderResult {
  return render(<RoomCard room={RoomModel.createMock()} />);
}

describe('RoomCard', () => {
  it('Should render component successfully.', () => {
    try {
      renderRoomCard();
      const wrapper = screen.getByTestId(dataTestids.root);
      expect(wrapper).toBeInTheDocument();
    } catch (e) {
      expect(true).toBe(false);
    }
  });
});
