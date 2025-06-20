import { render, RenderResult, screen } from '@testing-library/react';
import { dataTestids } from './data-test-ids';
import { PlayerCard } from '.';
import { PlayerModel } from '@/models/player/player-model';

function renderPlayerCard(): RenderResult {
  return render(<PlayerCard player={PlayerModel.createMock()} />);
}

describe('PlayerCard', () => {
  it('Should render component successfully.', () => {
    try {
      renderPlayerCard();
      const wrapper = screen.getByTestId(dataTestids.root);
      expect(wrapper).toBeInTheDocument();
    } catch (e) {
      expect(true).toBe(false);
    }
  });
});
