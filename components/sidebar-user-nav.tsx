'use client';

import Image from 'next/image';
import type { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { toast } from './toast';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { LoaderIcon } from './icons';
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
          <SidebarMenuButton className="h-10 justify-between">
            <div className="flex flex-row gap-2">
              <div className="size-6 bg-zinc-500/30 rounded-full animate-pulse" />
              <span className="bg-zinc-500/30 text-transparent rounded-md animate-pulse">
                Loading auth status
              </span>
            </div>
            <div className="animate-spin text-zinc-500">
              <LoaderIcon />
            </div>
          </SidebarMenuButton>
        ) : (
          <div className="flex flex-col w-full px-2">
            <div className="flex items-center gap-2 py-2">
              <Image
                src={`https://avatar.vercel.sh/${user.email}`}
                alt={user.email ?? 'User Avatar'}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="truncate">{isGuest ? 'Guest' : user?.email}</span>
            </div>

            <button
              className="w-full text-left px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              Toggle {theme === 'light' ? 'dark' : 'light'} mode
            </button>

            <button
              className="w-full text-left px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
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
