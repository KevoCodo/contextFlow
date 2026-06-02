import Link from "next/link";
import { CreateSourceForm } from "@/components/sources/create-source-form";
import { Badge } from "@/components/ui/badge";
import type { KnowledgeDocument, KnowledgeSource } from "@/lib/api/types";
import { serverGet } from "@/lib/api/server";
import { formatDateTime } from "@/lib/format";

async function fetchSources(): Promise<KnowledgeSource[]> {
  const res = await serverGet<{ items: KnowledgeSource[] }>("/api/sources");
  return res.items;
}

async function fetchDocuments(): Promise<KnowledgeDocument[]> {
  const res = await serverGet<{ items: KnowledgeDocument[] }>("/api/documents");
  return res.items;
}

export default async function SourcesPage() {
  const [items, documents] = await Promise.all([fetchSources(), fetchDocuments()]);
  const documentCounts = documents.reduce((counts, document) => {
    counts.set(document.source_id, (counts.get(document.source_id) ?? 0) + 1);
    return counts;
  }, new Map<number, number>());

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">Sources</h1>
          <p className="max-w-2xl text-sm text-[var(--muted)]">
            Sources group related manual documents so retrieval can be explained by knowledge area.
            No automated ingestion is included in this public MVP.
          </p>
        </div>
        <Badge>{items.length} sources</Badge>
      </header>

      <section className="rounded-xl border bg-[var(--card-2)] p-4">
        <div className="text-sm font-medium">Create source</div>
        <CreateSourceForm />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">All sources</div>
          <Link
            href="/sources"
            className="rounded-md border bg-white/6 px-3 py-1.5 text-xs hover:bg-white/10"
          >
            Refresh
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border bg-[var(--card-2)] p-6">
            <div className="text-sm font-medium">No sources yet</div>
            <div className="mt-1 text-sm text-[var(--muted)]">
              Create a source to group related documents for retrieval.
            </div>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((s) => (
              <Link
                key={s.id}
                href={`/sources/${s.id}`}
                className="rounded-xl border bg-[var(--card-2)] p-4 hover:bg-white/4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">{s.title}</div>
                  <Badge
                    variant={
                      s.status === "indexed"
                        ? "success"
                        : s.status === "failed"
                          ? "danger"
                          : "muted"
                    }
                  >
                    {s.status}
                  </Badge>
                </div>
                <div className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                  {s.description ?? "No description"}
                </div>
                <div className="mt-4 grid gap-2 text-xs text-[var(--muted)] sm:grid-cols-3">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wide text-[var(--muted)]">
                      Documents
                    </span>
                    <span className="text-[var(--foreground)]">{documentCounts.get(s.id) ?? 0}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wide text-[var(--muted)]">
                      Created
                    </span>
                    {formatDateTime(s.created_at)}
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wide text-[var(--muted)]">
                      Updated
                    </span>
                    {formatDateTime(s.updated_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
