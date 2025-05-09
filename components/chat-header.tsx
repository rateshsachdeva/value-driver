'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import { signOut, useSession } from 'next-auth/react';

import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { DarkModeToggle } from './ui/dark-mode-toggle';
import { guestRegex } from '@/lib/constants';

function PureChatHeader({
  chatId,
  selectedModelId,
  isReadonly,
}: {
  chatId: string;
  selectedModelId: string;
  isReadonly: boolean;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();
  const { data: session, status } = useSession();

  const isGuest = guestRegex.test(session?.user?.email ?? '');

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />

      {(!open || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <PlusIcon />
              <span className="md:sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      )}

      {!isReadonly && session && (
        <ModelSelector
          session={session}
          selectedModelId={selectedModelId}
          className="order-1 md:order-2"
        />
      )}

      {!isReadonly && (
        <div className="order-1 md:order-3">
          <DarkModeToggle />
        </div>
      )}

      <div className="ml-auto order-4 flex items-center space-x-2">
        {status === 'loading' ? (
          <span className="text-sm text-gray-500">Loading...</span>
        ) : session ? (
          <>
            <span className="text-sm truncate max-w-[120px]">{session.user?.email}</span>
            <Button
              size="sm"
              onClick={() =>
                signOut({
                  callbackUrl: '/',
                })
              }
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push('/guest')}
            >
              Continue as Guest
            </Button>
            <Button
              size="sm"
              onClick={() => router.push('/login')}
            >
              Login to your account
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
