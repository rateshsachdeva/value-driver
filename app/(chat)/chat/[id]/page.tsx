import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { message } from '@/lib/db/schema';
import type { Attachment, UIMessage } from 'ai';
import type { VisibilityType } from '@/components/visibility-selector';

// Define DBMessage type inline
type DBMessage = typeof message.$inferSelect;

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  if (chat.visibility === 'private') {
    if (!session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: [{ type: 'text', text: message.content }],
      role: message.role as UIMessage['role'],
      // Note: content will soon be deprecated in @ai-sdk/react
      content: '',
      createdAt: message.createdAt,
      experimental_attachments: [], // safely ignore missing attachments
    }));
  }

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');
  const visibilityType = chat.visibility as VisibilityType;

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType={visibilityType}
          isReadonly={session?.user?.id !== chat.userId}
          session={session}
          autoResume={true}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        initialChatModel={chatModelFromCookie.value}
        initialVisibilityType={visibilityType}
        isReadonly={session?.user?.id !== chat.userId}
        session={session}
        autoResume={true}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
