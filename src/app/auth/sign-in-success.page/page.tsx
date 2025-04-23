import { useContext, useEffect } from 'react';
import type { NextPage, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { AuthContext } from '@/contexts/auth-context';
import { Text } from '@/components/texts/text';

const Page: NextPage = function Page() {
  const router = useRouter();
  const accessToken = router.query.access_token as string | null;
  const oauthClientRedirectPath = router.query.client_redirect_path as string | null;

  const { signIn } = useContext(AuthContext);
  useEffect(() => {
    if (!accessToken || !oauthClientRedirectPath) {
      return;
    }
    signIn(accessToken);
    router.push(oauthClientRedirectPath);
  }, [accessToken, oauthClientRedirectPath]);

  return (
    <main className="relative w-full h-screen flex justify-center items-center bg-[#1E1E1E]">
      <div className="flex flex-col items-center">
        <Text>Login Success!</Text>
      </div>
    </main>
  );
};

export const getStaticProps: GetStaticProps = async () => ({
  props: {},
});

export default Page;
