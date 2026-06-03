import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { KnowledgeChunk, KnowledgeDocument, KnowledgeSource } from "@/lib/api/types";
import { serverGet } from "@/lib/api/server";
import { formatDateTime } from "@/lib/format";

async function fetchDocuments(): Promise<KnowledgeDocument[]> {
  const res = await serverGet<{ items: KnowledgeDocument[] }>("/api/documents");
  return res.items;
}

async function fetchSources(): Promise<KnowledgeSource[]> {
  const res = await serverGet<{ items: KnowledgeSource[] }>("/api/sources");
  return res.items;
}

async function fetchChunks(documentId: number): Promise<KnowledgeChunk[]> {
  const res = await serverGet<{ items: KnowledgeChunk[] }>(`/api/documents/${documentId}/chunks`);
  return res.items;
}

export default async function DocumentsPage() {
  const [items, sources] = await Promise.all([fetchDocuments(), fetchSources()]);
  const sourceNames = new Map(sources.map((source) => [source.id, source.title]));
  const chunkEntries = await Promise.all(
    items.map(async (document) => [document.id, await fetchChunks(document.id)] as const)
  );
  const chunkCounts = new Map(chunkEntries.map(([id, chunks]) => [id, chunks.length]));

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">Documents</h1>
          <p className="text-sm text-[var(--muted)]">
            Manual text documents are the MVP ingestion method for this public demo.
          </p>
        </div>
        <Link
          href="/documents/new"
          className="rounded-md border bg-white/6 px-4 py-2 text-sm hover:bg-white/10"
        >
          New document
        </Link>
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-[var(--card-2)] p-6">
          <div className="text-sm font-medium">No documents yet</div>
          <div className="mt-1 text-sm text-[var(--muted)]">
            Create a manual text document, then index it into chunks and embeddings.
          </div>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((d) => (
            <Link
              key={d.id}
              href={`/documents/${d.id}`}
              className="rounded-xl border bg-[var(--card-2)] p-4 hover:bg-white/4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">{d.title}</div>
                <Badge
                  variant={
                    d.status === "indexed" ? "success" : d.status === "failed" ? "danger" : "muted"
                  }
                >
                  {d.status}
                </Badge>
              </div>
              <div className="mt-2 text-sm text-[var(--muted)]">
                Source: {sourceNames.get(d.source_id) ?? `#${d.source_id}`}
              </div>
              <div className="mt-4 grid gap-2 text-xs text-[var(--muted)] sm:grid-cols-3">
                <div>
                  <span className="block text-[10px] uppercase tracking-wide">Chunks</span>
                  <span className="text-[var(--foreground)]">{chunkCounts.get(d.id) ?? 0}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wide">Created</span>
                  {formatDateTime(d.created_at)}
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wide">Last indexed</span>
                  {d.status === "indexed" ? formatDateTime(d.updated_at) : "Not indexed"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
