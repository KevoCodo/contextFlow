import Link from "next/link";
import { CreateSourceForm } from "@/components/sources/create-source-form";
import { Badge } from "@/components/ui/badge";
import type { KnowledgeSource } from "@/lib/api/types";
import { serverGet } from "@/lib/api/server";
import { formatDateTime } from "@/lib/format";

async function fetchSources(): Promise<KnowledgeSource[]> {
  const res = await serverGet<{ items: KnowledgeSource[] }>("/api/sources");
  return res.items;
}

export default async function SourcesPage() {
  const items = await fetchSources();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Sources</h1>
        <p className="text-sm text-[var(--muted)]">
          Manual sources group documents for this public RAG demo. No automated ingestion in the MVP.
        </p>
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
          <div className="rounded-xl border bg-[var(--card-2)] p-4 text-sm text-[var(--muted)]">
            No sources yet. Create one above to get started.
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
                <div className="mt-3 text-xs text-[var(--muted)]">
                  Created: {formatDateTime(s.created_at)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
