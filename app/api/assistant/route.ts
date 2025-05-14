import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import { db } from '@/lib/db/client';
import { chat, message as messageTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
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

  // ✅ Save chat + messages if user is signed in
  if (session?.user?.id) {
    const chatId = randomUUID(); // generate a stable ID

    // 1. Insert into chat table
    await db.insert(chat).values({
      id: chatId,
      userId: session.user.id,
      createdAt: new Date(),
      title: message.slice(0, 50),
      visibility: 'private',
    });

    // 2. Insert both messages
    await db.insert(messageTable).values([
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
