'use client';

import type { Attachment, Message, CreateMessage } from '@ai-sdk/react';
import { useEffect } from 'react';
import type { Vote } from '@/lib/db/schema';
import { SuggestedActions } from './suggestion';
import type { VisibilityType } from './visibility-selector';

interface ArtifactProps {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (event?: { preventDefault?: () => void }) => Promise<null>;
  status: 'streaming' | 'ready';
  stop: () => void;
  attachments: Attachment[];
  setAttachments: (attachments: Attachment[]) => void;
  append: (message: Message | CreateMessage) => Promise<void>;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  reload: () => Promise<null>;
  votes?: Vote[];
  isReadonly: boolean;
  selectedVisibilityType: VisibilityType;
}

export function Artifact({
  chatId,
  input,
  setInput,
  handleSubmit,
  status,
  stop,
  attachments,
  setAttachments,
  append,
  messages,
  setMessages,
  reload,
  votes,
  isReadonly,
  selectedVisibilityType,
}: ArtifactProps) {
  useEffect(() => {
    // Any side effects you want on mount
  }, []);

  return (
    <div className="artifact-container p-4">
      {messages.length === 0 && attachments.length === 0 && (
        <SuggestedActions
          append={append}
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
        />
      )}

      {/* Render attachment previews or custom artifact content here */}
      <div className="mt-2">
        <p className="text-muted-foreground text-sm">
          Attachments: {attachments.length}
        </p>
        {/* Add preview components if needed */}
      </div>
    </div>
  );
}
