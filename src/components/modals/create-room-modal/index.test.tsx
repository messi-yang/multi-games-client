import { render, RenderResult, screen } from '@testing-library/react';
import { dataTestids } from './data-test-ids';
import { CreateRoomModal } from '.';

function renderCreateRoomModal(): RenderResult {
  return render(<CreateRoomModal opened onConfirm={() => {}} onCancel={() => {}} />);
}

describe('CreateRoomModal', () => {
  it('Should render component successfully.', () => {
    try {
      renderCreateRoomModal();
      const wrapper = screen.getByTestId(dataTestids.root);
      expect(wrapper).toBeInTheDocument();
    } catch (e) {
      expect(true).toBe(false);
    }
  });
});
