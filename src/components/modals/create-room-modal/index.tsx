import { useCallback, useState } from 'react';
import { Text } from '@/components/texts/text';
import { BaseModal } from '@/components/modals/base-modal';
import { Button } from '@/components/buttons/button';
import { Input } from '@/components/inputs/input';
import { dataTestids } from './data-test-ids';
import { Field } from '@/components/fields/field';

type Props = {
  opened: boolean;
  onConfirm?: (roomName: string) => void;
  onCancel?: () => void;
};

export function CreateRoomModal({ opened, onConfirm = () => {}, onCancel = () => {} }: Props) {
  const [roomName, setRoomName] = useState('');

  const handleCreateClick = useCallback(() => {
    if (!roomName) return;
    onConfirm(roomName);
    setRoomName('');
  }, [roomName]);

  const handleCancelClick = useCallback(() => {
    setRoomName('');
    onCancel();
  }, []);

  return (
    <BaseModal width={400} opened={opened}>
      <section
        data-testid={dataTestids.root}
        className="relative p-6 w-full h-full flex flex-col items-center border-4 border-solid border-white bg-[#121212]"
      >
        <Text size="text-lg">Create new room</Text>
        <div className="mt-5 w-full">
          <Field label="Name">
            <Input value={roomName} onInput={setRoomName} placeholder="Enter room name" />
          </Field>
        </div>
        <section className="mt-9 w-full flex flex-row justify-end items-center">
          <Button text="Create" onClick={handleCreateClick} />
          <div className="ml-4">
            <Button text="Cancel" onClick={handleCancelClick} />
          </div>
        </section>
      </section>
    </BaseModal>
  );
}
