'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import type { Session } from 'next-auth';

function PureChatHeader({
  chatId,
  selectedModelId,
  isReadonly,
  session,
}: {
  chatId: string;
  selectedModelId: string;
  isReadonly: boolean;
  session: Session | null;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();

  const isLoggedIn = !!session?.user?.email;

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

      {!isReadonly && (
        <ModelSelector
          session={session}
          selectedModelId={selectedModelId}
          className="order-1 md:order-2"
        />
      )}

      <div className="order-1 md:order-3 flex items-center gap-2 ml-auto">
        {!isLoggedIn ? (
          <>
            <Button variant="outline" onClick={() => router.push('/login')}>
              Login to your account
            </Button>
            <Button variant="outline" onClick={() => router.push('/guest')}>
              Continue as Guest
            </Button>
          </>
        ) : (
          <span className="text-sm">
            {session.user.email}
            <Button
              variant="outline"
              className="ml-2"
              onClick={() => router.push('/api/auth/signout')}
            >
              Sign Out
            </Button>
          </span>
        )}
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
