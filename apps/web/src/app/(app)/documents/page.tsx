import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { KnowledgeDocument } from "@/lib/api/types";
import { serverGet } from "@/lib/api/server";
import { formatDateTime } from "@/lib/format";

async function fetchDocuments(): Promise<KnowledgeDocument[]> {
  const res = await serverGet<{ items: KnowledgeDocument[] }>("/api/documents");
  return res.items;
}

export default async function DocumentsPage() {
  const items = await fetchDocuments();

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
        <div className="rounded-xl border bg-[var(--card-2)] p-4 text-sm text-[var(--muted)]">
          No documents yet. Create one to index into chunks.
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
              <div className="mt-2 text-xs text-[var(--muted)]">Source: {d.source_id}</div>
              <div className="mt-3 text-xs text-[var(--muted)]">
                Created: {formatDateTime(d.created_at)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
