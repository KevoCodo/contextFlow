import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { serverGet } from "@/lib/api/server";

type StatsResponse = {
  sources: number;
  documents: number;
  chunks_indexed: number;
  ask_sessions: number;
};

type AskSession = {
  id: number;
  question: string;
  answer: string | null;
  created_at: string;
};

function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border bg-[var(--card-2)] p-4">
      <div className="text-xs text-[var(--muted)]">{title}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-[var(--muted)]">{hint}</div>
    </div>
  );
}

async function fetchStats(): Promise<StatsResponse> {
  return serverGet<StatsResponse>("/api/stats");
}

async function fetchRecentAskSessions(): Promise<AskSession[]> {
  const res = await serverGet<{ items: AskSession[] }>("/api/ask-sessions");
  return res.items.slice(0, 3);
}

export default async function DashboardPage() {
  const stats = await fetchStats();
  const recent = await fetchRecentAskSessions();

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">ContextFlow</h1>
          <Badge>Standalone public RAG showcase</Badge>
        </div>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Demonstrates a practical RAG pipeline: manual knowledge entry, chunking, OpenAI embeddings,
          pgvector retrieval, and grounded outputs with sources.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/sources"
            className="inline-flex items-center justify-center rounded-md border bg-white/6 px-4 py-2 text-sm hover:bg-white/10"
          >
            Create a Source
          </Link>
          <Link
            href="/documents/new"
            className="inline-flex items-center justify-center rounded-md border bg-white/6 px-4 py-2 text-sm hover:bg-white/10"
          >
            Add a Document
          </Link>
          <Link
            href="/ask"
            className="inline-flex items-center justify-center rounded-md border bg-white/6 px-4 py-2 text-sm hover:bg-white/10"
          >
            Ask a Question
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard title="Knowledge Sources" value={String(stats.sources)} hint="Manual groups" />
        <StatCard title="Documents" value={String(stats.documents)} hint="Manual text ingestion" />
        <StatCard title="Indexed Chunks" value={String(stats.chunks_indexed)} hint="With embeddings" />
        <StatCard title="Ask Sessions" value={String(stats.ask_sessions)} hint="Saved runs" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-[var(--card-2)] p-4">
          <div className="text-sm font-medium">Retrieval pipeline</div>
          <div className="mt-3 grid gap-3 md:grid-cols-5">
            {["Manual text", "Chunking", "Embeddings", "Vector search", "Grounded output"].map(
              (label) => (
                <div key={label} className="rounded-lg border bg-black/10 p-3 text-xs">
                  <div className="font-medium">{label}</div>
                  <div className="mt-1 text-[var(--muted)]">Ready</div>
                </div>
              )
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-[var(--card-2)] p-4">
          <div className="text-sm font-medium">Demo flow</div>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-[var(--muted)]">
            <li>Create a source</li>
            <li>Add a manual text document</li>
            <li>Index the document (chunk + embed)</li>
            <li>Ask a question (semantic retrieval)</li>
            <li>Review grounded output + sources</li>
          </ol>
          <div className="mt-4 rounded-lg border bg-black/10 p-3 text-xs text-[var(--muted)]">
            This is a portfolio demo, not a production SaaS. No auth, billing, uploads, crawling, or
            proprietary data.
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-[var(--card-2)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium">Recent activity</div>
          <Link
            href="/ask-sessions"
            className="rounded-md border bg-white/6 px-3 py-1.5 text-xs hover:bg-white/10"
          >
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="mt-3 text-sm text-[var(--muted)]">
            No activity yet. Ask a question to create an ask session.
          </div>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {recent.map((s) => (
              <div key={s.id} className="rounded-lg border bg-black/10 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-[var(--muted)]">Session #{s.id}</div>
                  <div className="text-[10px] text-[var(--muted)]">
                    {new Date(s.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="mt-2 line-clamp-3 text-sm">{s.question}</div>
                <div className="mt-3">
                  <Badge variant={s.answer ? "success" : "muted"}>
                    {s.answer ? "Answered" : "Retrieved"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
