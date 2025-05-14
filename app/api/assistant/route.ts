import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@/app/(auth)/auth';

import { db } from '@/lib/db/client';
import { chat, chatMessage } from '@/lib/db/schema';
import { randomUUID } from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const { message, threadId } = await req.json();

  const thread = threadId
    ? await openai.beta.threads.retrieve(threadId)
    : await openai.beta.threads.create();

  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: message,
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: process.env.OPENAI_ASSISTANT_ID!,
  });

  let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  }

  if (runStatus.status === 'failed') {
    return NextResponse.json({ error: 'Assistant run failed' }, { status: 500 });
  }

  const messages = await openai.beta.threads.messages.list(thread.id);
  const assistantMessage = messages.data.find((msg) => msg.role === 'assistant');

  let text = 'No response';
  if (assistantMessage?.content && Array.isArray(assistantMessage.content)) {
    const textContent = assistantMessage.content.find((c) => c.type === 'text');
    if (
      textContent &&
      typeof textContent === 'object' &&
      'text' in textContent &&
      textContent.text &&
      'value' in textContent.text
    ) {
      text = textContent.text.value as string;
    }
  }

  // ✅ Save chat and messages only if user is signed in
  if (session?.user?.id) {
    const chatId = randomUUID();

    // Save Chat
    await db.insert(chat).values({
      id: chatId,
      userId: session.user.id,
      createdAt: new Date(),
      title: message.slice(0, 50),
      visibility: 'private',
    });

    // Save both messages
    await db.insert(chatMessage).values([
      {
        id: randomUUID(),
        chatId,
        role: 'user',
        content: message,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        chatId,
        role: 'assistant',
        content: text,
        createdAt: new Date(),
      },
    ]);
  }

  return NextResponse.json({
    message: text,
    threadId: thread.id,
  });
}
