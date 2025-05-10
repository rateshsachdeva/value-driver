'use client';

import { useState } from 'react';
import type { CreateMessage, Message } from '@ai-sdk/react';
import { Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { SuggestedActions } from './suggestion';
import type { Attachment } from 'ai';
import { AttachmentPreview } from './attachment-preview';
import { UploadDropzone } from './upload-dropzone';
import type { VisibilityType } from './visibility-selector';

interface MultimodalInputProps {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (event?: { preventDefault?: () => void }) => Promise<null>;
  status: 'streaming' | 'ready';
  stop: () => void;
  attachments: Attachment[];
  setAttachments: (attachments: Attachment[]) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  append: (message: Message | CreateMessage) => Promise<void>;
  selectedVisibilityType: VisibilityType;
}

export function MultimodalInput({
  chatId,
  input,
  setInput,
  handleSubmit,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  selectedVisibilityType,
}: MultimodalInputProps) {
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);

  return (
    <div className="w-full">
      <UploadDropzone
        onDrop={(files) => setUploadQueue((prev) => [...prev, ...files])}
      />
      <AttachmentPreview
        attachments={attachments}
        setAttachments={setAttachments}
        uploadQueue={uploadQueue}
        setUploadQueue={setUploadQueue}
      />
      {messages.length === 0 && attachments.length === 0 && uploadQueue.length === 0 && (
        <SuggestedActions
          append={append}
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
        />
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex items-center gap-2 mt-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button type="submit" disabled={status === 'streaming'}>
          {status === 'streaming' ? 'Sending...' : 'Send'}
        </Button>
        <Button
          type="button"
          onClick={stop}
          disabled={status !== 'streaming'}
          variant="secondary"
        >
          Stop
        </Button>
      </form>
    </div>
  );
}
