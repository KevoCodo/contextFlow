import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { KnowledgeDocument, KnowledgeSource } from "@/lib/api/types";
import { serverGet } from "@/lib/api/server";
import { formatDateTime } from "@/lib/format";

async function fetchSource(sourceId: number): Promise<KnowledgeSource> {
  return serverGet<KnowledgeSource>(`/api/sources/${sourceId}`);
}

async function fetchDocuments(sourceId: number): Promise<KnowledgeDocument[]> {
  const res = await serverGet<{ items: KnowledgeDocument[] }>(`/api/documents?source_id=${sourceId}`);
  return res.items;
}

export default async function SourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sourceId = Number(id);

  if (!Number.isFinite(sourceId)) {
    return (
      <div className="rounded-xl border bg-[var(--card-2)] p-4 text-sm text-red-300">
        Invalid source id.
      </div>
    );
  }

  const source = await fetchSource(sourceId);
  const documents = await fetchDocuments(sourceId);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{source.title}</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {source.description ?? "No description"}
            </p>
          </div>
          <Badge
            variant={
              source.status === "indexed"
                ? "success"
                : source.status === "failed"
                  ? "danger"
                  : "muted"
            }
          >
            {source.status}
          </Badge>
        </div>
        <div className="text-xs text-[var(--muted)]">
          Created: {formatDateTime(source.created_at)}
        </div>
      </header>

      <section className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/documents/new?source_id=${source.id}`}
          className="inline-flex items-center justify-center rounded-md border bg-white/6 px-4 py-2 text-sm hover:bg-white/10"
        >
          Create document for this source
        </Link>
        <Link
          href="/documents"
          className="inline-flex items-center justify-center rounded-md border bg-white/6 px-4 py-2 text-sm hover:bg-white/10"
        >
          View all documents
        </Link>
      </section>

      <section className="space-y-3">
        <div className="text-sm font-medium">Documents</div>
        {documents.length === 0 ? (
          <div className="rounded-xl border bg-[var(--card-2)] p-4 text-sm text-[var(--muted)]">
            No documents for this source yet.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {documents.map((d) => (
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
                <div className="mt-3 text-xs text-[var(--muted)]">
                  Created: {formatDateTime(d.created_at)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
