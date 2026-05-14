import Link from "next/link";
import { IndexDocumentButton } from "@/components/documents/index-document-button";
import { Badge } from "@/components/ui/badge";
import type { KnowledgeChunk, KnowledgeDocument } from "@/lib/api/types";
import { serverGet } from "@/lib/api/server";
import { formatDateTime } from "@/lib/format";

async function fetchDocument(documentId: number): Promise<KnowledgeDocument> {
  return serverGet<KnowledgeDocument>(`/api/documents/${documentId}`);
}

async function fetchChunks(documentId: number): Promise<KnowledgeChunk[]> {
  const res = await serverGet<{ items: KnowledgeChunk[] }>(`/api/documents/${documentId}/chunks`);
  return res.items;
}

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const documentId = Number(id);

  if (!Number.isFinite(documentId)) {
    return (
      <div className="rounded-xl border bg-[var(--card-2)] p-4 text-sm text-red-300">
        Invalid document id.
      </div>
    );
  }

  const document = await fetchDocument(documentId);
  const chunks = await fetchChunks(documentId);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{document.title}</h1>
            <div className="mt-1 text-sm text-[var(--muted)]">Source: #{document.source_id}</div>
          </div>
          <Badge
            variant={
              document.status === "indexed"
                ? "success"
                : document.status === "failed"
                  ? "danger"
                  : "muted"
            }
          >
            {document.status}
          </Badge>
        </div>
        <div className="text-xs text-[var(--muted)]">
          Created: {formatDateTime(document.created_at)}
        </div>
      </header>

      <section className="rounded-xl border bg-[var(--card-2)] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium">Indexing / chunking</div>
            <div className="mt-1 text-sm text-[var(--muted)]">
              Indexing creates chunks and embeddings for semantic retrieval (no final answer generation yet).
            </div>
          </div>
          <IndexDocumentButton documentId={documentId} />
        </div>
      </section>

      <section className="rounded-xl border bg-[var(--card-2)] p-4">
        <div className="text-sm font-medium">Content preview</div>
        <div className="mt-3 whitespace-pre-wrap text-sm text-[var(--muted)]">
          {document.content.length > 1200 ? `${document.content.slice(0, 1200)}...` : document.content}
        </div>
        <div className="mt-3">
          <Link
            href="/documents"
            className="inline-flex items-center justify-center rounded-md border bg-white/6 px-3 py-1.5 text-xs hover:bg-white/10"
          >
            Back to documents
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium">Chunks</div>
          <div className="text-xs text-[var(--muted)]">{chunks.length} chunks</div>
        </div>

        {chunks.length === 0 ? (
          <div className="rounded-xl border bg-[var(--card-2)] p-4 text-sm text-[var(--muted)]">
            No chunks yet. Use the index button to generate chunks.
          </div>
        ) : (
          <div className="grid gap-3">
            {chunks.map((c) => (
              <div key={c.id} className="rounded-xl border bg-[var(--card-2)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">Chunk {c.chunk_index}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {typeof c.chunk_metadata?.character_count === "number"
                      ? `${c.chunk_metadata.character_count} chars`
                      : null}
                  </div>
                </div>
                <div className="mt-2 text-xs text-[var(--muted)]">
                  Embedding: {c.has_embedding ? "present" : "missing"}
                </div>
                <div className="mt-3 whitespace-pre-wrap text-sm text-[var(--muted)]">
                  {c.chunk_text}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
