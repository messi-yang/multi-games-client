'use client';

import { useContext, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/auth-context';
import { Text } from '@/components/texts/text';
import { Button } from '@/components/buttons/button';

export default function Page() {
  const { isSingedIn, setOauthClientRedirectPath, startGoogleOauthFlow } = useContext(AuthContext);
  const router = useRouter();
  useEffect(() => {
    if (isSingedIn) {
      router.push('/dashboard/rooms');
    }
  }, [isSingedIn]);

  const handleGoogleLoginClick = () => {
    setOauthClientRedirectPath('/dashboard/rooms');
    startGoogleOauthFlow();
  };

  return (
    <main className="relative w-full h-screen flex justify-center items-center bg-[#1E1E1E]">
      <div className="flex flex-col items-center">
        <Text size="text-base">Welcome To</Text>
        <div className="mt-5">
          <Button
            text="Continue with"
            onClick={handleGoogleLoginClick}
            rightChild={<Image src="/assets/images/third-party/google.png" alt="google" width={71} height={24} />}
          />
        </div>
      </div>
    </main>
  );
}
