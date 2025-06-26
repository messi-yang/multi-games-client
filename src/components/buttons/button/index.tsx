import { useCallback, useState } from 'react';
import classnames from 'classnames';
import { Text } from '@/components/texts/text';
import { dataTestids } from './data-test-ids';

type Props = {
  text: string;
  rightChild?: React.ReactNode;
  loading?: boolean;
  onClick?: () => any;
};

export function Button({ text, rightChild, loading = false, onClick = () => {} }: Props) {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  const handleClick = useCallback(() => {
    if (loading) return;
    onClick();
  }, [onClick, loading]);

  return (
    <button
      data-testid={dataTestids.root}
      type="button"
      className={classnames(
        'relative',
        'backdrop-blur-sm',
        'bg-gradient-to-br',
        'from-white/30',
        'to-white/10',
        'text-white',
        'font-bold',
        'px-6',
        'py-2',
        'rounded-full',
        'border',
        'border-white/20',
        'shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
        'transition-all',
        'duration-75',
        'before:absolute',
        'before:inset-0',
        'before:rounded-full',
        'before:bg-gradient-to-br',
        'before:from-white/20',
        'before:to-transparent',
        'before:opacity-0',
        'hover:before:opacity-100',
        'active:translate-y-1',
        'active:shadow-sm',
        isPressed ? 'translate-y-1 shadow-sm' : 'translate-y-0',
        loading ? 'opacity-75 cursor-not-allowed' : ''
      )}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={loading}
    >
      <div className="flex items-center justify-center gap-2 relative">
        <Text size="text-lg">{loading ? 'Processing...' : text}</Text>
        {rightChild}
      </div>
    </button>
  );
}
