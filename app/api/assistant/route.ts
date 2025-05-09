import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
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

  // Safely extract text content from assistant message
  let text = 'No response';
  if (assistantMessage?.content) {
    const textContent = assistantMessage.content.find(
      (c: any) => c.type === 'text'
    );
    if (textContent && 'text' in textContent && textContent.text?.value) {
      text = textContent.text.value;
    }
  }

  return NextResponse.json({
    message: text,
    threadId: thread.id,
  });
}
