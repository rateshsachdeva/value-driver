'use client';

import React from 'react';
import { SuggestedActions } from './suggestion';

export type ArtifactKind = 'text' | 'code' | 'image';

export const artifactDefinitions = {
  text: { label: 'Text Artifact' },
  code: { label: 'Code Artifact' },
  image: { label: 'Image Artifact' },
};

export const Artifact = ({
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
}: any) => {
  return (
    <div>
      <h2>Artifact Component</h2>
      {/* Example usage of SuggestedActions */}
      <SuggestedActions
        append={append}
        chatId={chatId}
        selectedVisibilityType={selectedVisibilityType}
      />
    </div>
  );
};
