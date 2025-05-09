'use client';

import Image from 'next/image';
import type { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { toast } from './toast';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { LoaderIcon, SunIcon, MoonIcon } from './icons';
import { guestRegex } from '@/lib/constants';

export function SidebarUserNav({ user }: { user: User }) {
  const router = useRouter();
  const { data, status } = useSession();
  const { setTheme, theme } = useTheme();
  const isGuest = guestRegex.test(data?.user?.email ?? '');

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {status === 'loading' ? (
          <div className="flex flex-col w-full px-3 py-2">
            <div className="flex items-center gap-2 animate-pulse">
              <div className="size-6 bg-zinc-500/30 rounded-full" />
              <span className="bg-zinc-500/30 text-transparent rounded-md">
                Loading auth...
              </span>
            </div>
            <div className="mt-2 flex justify-center text-zinc-500 animate-spin">
              <LoaderIcon />
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full px-3 py-2 space-y-2">
            <div className="flex items-center gap-2">
              <Image
                src={`https://avatar.vercel.sh/${user.email}`}
                alt={user.email ?? 'User Avatar'}
                width={28}
                height={28}
                className="rounded-full"
              />
              <span className="truncate text-sm">{isGuest ? 'Guest' : user?.email}</span>
            </div>

            <button
              className="flex items-center gap-2 px-2 py-1 text-left rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'light' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
              Toggle {theme === 'light' ? 'dark' : 'light'} mode
            </button>

            <button
              className="flex items-center gap-2 px-2 py-1 text-left rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
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
                  signOut({ callbackUrl: '/' });
                }
              }}
            >
              {isGuest ? 'Login to your account' : 'Sign out'}
            </button>
          </div>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
