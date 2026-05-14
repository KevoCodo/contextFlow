import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { AskSession } from "@/lib/api/types";
import { serverGet } from "@/lib/api/server";
import { formatDateTime } from "@/lib/format";

async function fetchSessions(): Promise<AskSession[]> {
  const res = await serverGet<{ items: AskSession[] }>("/api/ask-sessions");
  return res.items;
}

export default async function AskSessionsPage() {
  const items = await fetchSessions();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Ask Sessions</h1>
          <Link
            href="/ask"
            className="rounded-md border bg-white/6 px-3 py-2 text-sm hover:bg-white/10"
          >
            New question
          </Link>
        </div>
        <p className="text-sm text-[var(--muted)]">
          Recent retrieval/ask runs saved for demo visibility and debugging.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-[var(--card-2)] p-4 text-sm text-[var(--muted)]">
          No ask sessions yet. Ask a question to create one.
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((s) => (
            <div key={s.id} className="rounded-xl border bg-[var(--card-2)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-medium">Session #{s.id}</div>
                <div className="text-xs text-[var(--muted)]">{formatDateTime(s.created_at)}</div>
              </div>

              <div className="mt-3 text-xs text-[var(--muted)]">Question</div>
              <div className="mt-1 whitespace-pre-wrap text-sm">{s.question}</div>

              <div className="mt-4 flex items-center gap-2">
                <Badge variant={s.answer ? "success" : "muted"}>
                  {s.answer ? "Answer generated" : "Retrieval only"}
                </Badge>
                <Badge>{Array.isArray(s.retrieved_chunks) ? `${s.retrieved_chunks.length} chunks` : "0 chunks"}</Badge>
              </div>

              {s.answer ? (
                <>
                  <div className="mt-4 text-xs text-[var(--muted)]">Answer preview</div>
                  <div className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm text-[var(--muted)]">
                    {s.answer}
                  </div>
                </>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

