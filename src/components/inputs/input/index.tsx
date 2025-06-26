import { FormEventHandler, useCallback } from 'react';
import classnames from 'classnames';
import { dataTestids } from './data-test-ids';

type Props = {
  value: string;
  disabled?: boolean;
  placeholder?: string;
  onInput?: (newValue: string) => void;
};

export function Input({ value, disabled = false, placeholder = '', onInput = () => {} }: Props) {
  const handleInput: FormEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      // @ts-ignore
      const newValue = e.target.value as string;
      onInput(newValue);
    },
    [onInput]
  );

  return (
    <input
      data-testid={dataTestids.root}
      className={classnames(
        'flex',
        'w-full',
        'bg-white/20',
        'backdrop-blur-sm',
        'border',
        'border-white/20',
        'text-white/90',
        'text-sm',
        'rounded-xl',
        'focus:ring-white/30',
        'focus:border-white/30',
        'p-2.5',
        'shadow-lg',
        'placeholder:text-white/50',
        'hover:bg-white/30',
        'transition-colors'
      )}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onInput={handleInput}
    />
  );
}
