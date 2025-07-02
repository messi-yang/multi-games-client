import { useCallback, useState } from 'react';
import { BaseModal } from '@/components/modals/base-modal';
import { Button } from '@/components/buttons/button';
import { Input } from '@/components/inputs/input';
import { Field } from '@/components/fields/field';

type Props = {
  opened: boolean;
  isSignedIn: boolean;
  onComfirm: (playerName: string | null) => void;
};

export function JoinRoomModal({ opened, isSignedIn, onComfirm }: Props) {
  const [playerName, setPlayerName] = useState('');

  const handleConfirm = useCallback(() => {
    if (isSignedIn) {
      onComfirm(null);
    } else {
      if (!playerName) {
        return;
      }
      onComfirm(playerName);
    }
  }, [isSignedIn, playerName, onComfirm]);

  return (
    <BaseModal width={300} opened={opened}>
      <section className="relative p-6 w-full h-full flex flex-col items-center border-4 border-solid border-white bg-[#121212] gap-4">
        {!isSignedIn && (
          <Field label="Your name">
            <Input value={playerName} onInput={(value) => setPlayerName(value)} placeholder="Enter your name" />
          </Field>
        )}
        <section className="flex flex-row justify-center items-center">
          <Button text="Join Room" onClick={handleConfirm} />
        </section>
      </section>
    </BaseModal>
  );
}
