import { auth } from '@/app/(auth)/auth';
import type { ArtifactKind } from '@/components/artifact';
import {
  deleteDocumentsByIdAfterTimestamp,
  getDocumentsById,
  saveDocument,
} from '@/lib/db/queries';

// Explicit document type to include userId
interface DocumentWithUserId {
  id: string;
  chatId: string;
  createdAt: Date;
  title: string;
  content: string;
  type: string | null;
  userId: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return new Response('Missing id', { status: 400 });

  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const documents = (await getDocumentsById({ id })) as DocumentWithUserId[];
  const [document] = documents;

  if (!document) return new Response('Not found', { status: 404 });
  if (document.userId !== session.user.id)
    return new Response('Forbidden', { status: 403 });

  return Response.json(documents, { status: 200 });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return new Response('Missing id', { status: 400 });

  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const {
    content,
    title,
    kind,
  }: { content: string; title: string; kind: ArtifactKind } =
    await request.json();

  const documents = (await getDocumentsById({ id })) as DocumentWithUserId[];
  if (documents.length > 0) {
    const [document] = documents;
    if (document.userId !== session.user.id)
      return new Response('Forbidden', { status: 403 });
  }

  const document = await saveDocument({
    id,
    content,
    title,
    kind,
    userId: session.user.id,
  });

  return Response.json(document, { status: 200 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const timestamp = searchParams.get('timestamp');

  if (!id) return new Response('Missing id', { status: 400 });
  if (!timestamp) return new Response('Missing timestamp', { status: 400 });

  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const documents = (await getDocumentsById({ id })) as DocumentWithUserId[];
  const [document] = documents;

  if (!document || document.userId !== session.user.id)
    return new Response('Unauthorized', { status: 401 });

  const documentsDeleted = await deleteDocumentsByIdAfterTimestamp({
    id,
    timestamp: new Date(timestamp),
  });

  return Response.json(documentsDeleted, { status: 200 });
}
