'use client';

import Image from 'next/image';
import type { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { toast } from './toast';
import { guestRegex } from '@/lib/constants';
import { LoaderIcon } from './icons';

export function SidebarUserNav({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { data, status } = useSession();
  const { setTheme, theme } = useTheme();

  const isGuest = guestRegex.test(data?.user?.email ?? '');

  return (
    <div className="flex flex-col p-2 gap-2">
      <div className="flex items-center gap-2">
        {status === 'loading' ? (
          <>
            <div className="w-6 h-6 bg-zinc-500/30 rounded-full animate-pulse" />
            <span className="text-sm text-zinc-500 animate-pulse">Loading...</span>
            <LoaderIcon className="animate-spin ml-auto" />
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
            <span className="truncate text-sm">
              {isGuest ? 'Guest' : user?.email}
            </span>
          </>
        )}
      </div>

      <button
        className="text-left text-sm hover:underline"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      </button>

      <button
        className="text-left text-sm hover:underline"
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
