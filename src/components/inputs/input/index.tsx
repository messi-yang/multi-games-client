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
        'bg-gray-50',
        'border',
        'border-gray-300',
        'text-gray-900',
        'text-sm',
        'rounded-lg',
        'focus:ring-blue-500',
        'focus:border-blue-500',
        'p-2.5'
      )}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onInput={handleInput}
    />
  );
}
