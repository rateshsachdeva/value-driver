export type ArtifactKind = 'text' | 'code' | 'image';

export interface ArtifactDefinition {
  kind: ArtifactKind;
  onStreamPart?: ({
    streamPart,
    setArtifact,
    setMetadata,
  }: {
    streamPart: any;
    setArtifact: (updater: (draft: any) => any) => void;
    setMetadata: (metadata: any) => void;
  }) => void;
}

export const artifactDefinitions: ArtifactDefinition[] = [
  {
    kind: 'text',
    onStreamPart: ({ streamPart, setArtifact }) => {
      if (streamPart.type === 'text-delta') {
        setArtifact((draft: any) => ({
          ...draft,
          content: (draft.content || '') + streamPart.content,
        }));
      }
    },
  },
  {
    kind: 'code',
    onStreamPart: ({ streamPart, setArtifact }) => {
      if (streamPart.type === 'code-delta') {
        setArtifact((draft: any) => ({
          ...draft,
          content: (draft.content || '') + streamPart.content,
        }));
      }
    },
  },
  {
    kind: 'image',
    onStreamPart: ({ streamPart, setMetadata }) => {
      if (streamPart.type === 'image-delta') {
        setMetadata((prev: any) => ({
          ...prev,
          imageUrl: streamPart.content,
        }));
      }
    },
  },
];
