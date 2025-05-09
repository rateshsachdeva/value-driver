'use client';

import type { Attachment, UIMessage, Message } from 'ai';
import { useEffect, useState, useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';
import { toast } from './toast';
import type { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useAutoResume } from '@/hooks/use-auto-resume';
import type { VisibilityType } from './visibility-selector';

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session | null; // ✅ allow null safely
  autoResume: boolean;
}) {
  const { mutate } = useSWRConfig();
  const { visibilityType } = useChatVisibility({ chatId: id, initialVisibilityType });

  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  const sendMessage = useCallback(
    async (userInput: string) => {
      if (!userInput.trim()) return;

      const userMessage: UIMessage = {
        id: generateUUID(),
        role: 'user',
        content: userInput,
        parts: [{ type: 'text', text: userInput }],
      };
      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);

      try {
        const res = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userInput, threadId }),
        });

        const data = await res.json();

        const assistantMessage: UIMessage = {
          id: generateUUID(),
          role: 'assistant',
          content: data.message,
          parts: [{ type: 'text', text: data.message }],
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setThreadId(data.threadId);
      } catch (error: any) {
        toast({ type: 'error', description: error.message || 'Failed to send message.' });
      } finally {
        setLoading(false);
      }

      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    [mutate, threadId]
  );

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage(query);
      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `/chat/${id}`);
    }
  }, [query, hasAppendedQuery, id, sendMessage]);

  useAutoResume({
    autoResume,
    initialMessages,
    experimental_resume: () => {},
    data: [],
    setMessages: (msgs) => {
      setMessages(msgs as UIMessage[]);
    },
  });

  const handleSetMessagesForMessagesComponent = (
    update: Message[] | ((messages: Message[]) => Message[])
  ) => {
    if (typeof update === 'function') {
      setMessages((prev) => update(prev) as UIMessage[]);
    } else {
      setMessages(update as UIMessage[]);
    }
  };

  const handleSubmit = (event?: { preventDefault?: () => void }) => {
    if (event?.preventDefault) event.preventDefault();
    sendMessage(input);
    setInput('');
    return Promise.resolve(null);
  };

  const handleAppend = (msg: unknown) => {
    setMessages((prev) => [...prev, msg as UIMessage]);
    return Promise.resolve(null);
  };

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={initialChatModel}
          isReadonly={isReadonly}
          session={session} // ✅ pass session (can be null)
        />
        <Messages
          chatId={id}
          status={loading ? 'streaming' : 'ready'}
          votes={votes}
          messages={messages}
          setMessages={handleSetMessagesForMessagesComponent}
          reload={async () => null}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />
        <form
          className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
            setInput('');
          }}
        >
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={loading ? 'streaming' : 'ready'}
              stop={() => null}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={handleSetMessagesForMessagesComponent}
              append={handleAppend}
              selectedVisibilityType={visibilityType}
            />
          )}
        </form>
      </div>
      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        status={loading ? 'streaming' : 'ready'}
        stop={() => null}
        attachments={attachments}
        setAttachments={setAttachments}
        append={handleAppend}
        messages={messages}
        setMessages={handleSetMessagesForMessagesComponent}
        reload={async () => null}
        votes={votes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
      />
    </>
  );
}
