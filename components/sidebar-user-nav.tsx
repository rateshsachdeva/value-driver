'use client';

import Image from 'next/image';
import type { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { toast } from './toast';
import { LoaderIcon } from './icons';
import { guestRegex } from '@/lib/constants';

export function SidebarUserNav({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { data, status } = useSession();
  const { setTheme, theme } = useTheme();

  const isGuest = guestRegex.test(data?.user?.email ?? '');

  return (
    <div className="flex flex-col p-2 gap-2 text-sm">
      <div className="flex items-center gap-2">
        {status === 'loading' ? (
          <>
            <div className="size-6 bg-zinc-500/30 rounded-full animate-pulse" />
            <span className="bg-zinc-500/30 text-transparent rounded-md animate-pulse">
              Loading...
            </span>
            <span className="animate-spin ml-auto text-zinc-500">
              <LoaderIcon size={20} />
            </span>
          </>
        ) : (
          <>
            <Image
              src={`https://avatar.vercel.sh/${user?.email ?? 'guest'}`}
              alt={user?.email ?? 'Guest Avatar'}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="truncate">{isGuest ? 'Guest' : user?.email}</span>
          </>
        )}
      </div>

      <button
        className="text-left hover:underline"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      </button>

      <button
        className="text-left hover:underline"
        onClick={() => {
          if (status === 'loading') {
            toast({
              type: 'error',
              description: 'Checking authentication status, please try again!',
            });
            return;
          }
          if (isGuest) {
            router.push('/login');
          } else {
            signOut({ redirectTo: '/' });
          }
        }}
      >
        {isGuest ? 'Login to your account' : 'Sign out'}
      </button>
    </div>
  );
}
