import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { KnowledgeChunk, KnowledgeDocument, KnowledgeSource } from "@/lib/api/types";
import { serverGet } from "@/lib/api/server";
import { formatDateTime } from "@/lib/format";

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
  accent,
}: {
  title: string;
  value: string;
  hint: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border bg-[var(--card-2)] p-4 shadow-sm">
      <div className="text-xs text-[var(--muted)]">{title}</div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {accent ? <div className="text-xs text-[var(--muted)]">{accent}</div> : null}
      </div>
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

async function fetchSources(): Promise<KnowledgeSource[]> {
  const res = await serverGet<{ items: KnowledgeSource[] }>("/api/sources");
  return res.items;
}

async function fetchDocuments(): Promise<KnowledgeDocument[]> {
  const res = await serverGet<{ items: KnowledgeDocument[] }>("/api/documents");
  return res.items;
}

async function fetchChunks(documentId: number): Promise<KnowledgeChunk[]> {
  const res = await serverGet<{ items: KnowledgeChunk[] }>(`/api/documents/${documentId}/chunks`);
  return res.items;
}

export default async function DashboardPage() {
  const [stats, recent, sources, documents] = await Promise.all([
    fetchStats(),
    fetchRecentAskSessions(),
    fetchSources(),
    fetchDocuments(),
  ]);

  const chunkEntries = await Promise.all(
    documents.map(async (document) => [document.id, await fetchChunks(document.id)] as const)
  );
  const chunkCounts = new Map(chunkEntries.map(([id, chunks]) => [id, chunks.length]));
  const totalChunks = chunkEntries.reduce((sum, [, chunks]) => sum + chunks.length, 0);
  const indexedDocuments = documents.filter((document) => document.status === "indexed").length;
  const sourceNames = new Map(sources.map((source) => [source.id, source.title]));
  const recentDocuments = documents
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Knowledge Sources" value={String(stats.sources)} hint="Manual groups" />
        <StatCard title="Documents" value={String(stats.documents)} hint="Manual text ingestion" />
        <StatCard title="Total Chunks" value={String(totalChunks)} hint="Generated context units" />
        <StatCard
          title="Indexed Documents"
          value={String(indexedDocuments)}
          hint="Ready for retrieval"
          accent={`${documents.length} total`}
        />
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

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-[var(--card-2)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Recent documents</div>
              <div className="mt-1 text-xs text-[var(--muted)]">What knowledge has been added?</div>
            </div>
            <Link href="/documents" className="rounded-md border bg-white/6 px-3 py-1.5 text-xs hover:bg-white/10">
              View all
            </Link>
          </div>

          {recentDocuments.length === 0 ? (
            <div className="mt-4 rounded-lg border bg-black/10 p-4 text-sm text-[var(--muted)]">
              No documents yet. Add a manual document to create retrievable context.
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {recentDocuments.map((document) => (
                <Link
                  key={document.id}
                  href={`/documents/${document.id}`}
                  className="rounded-lg border bg-black/10 p-3 hover:bg-white/5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium">{document.title}</div>
                    <Badge variant={document.status === "indexed" ? "success" : document.status === "failed" ? "danger" : "muted"}>
                      {document.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-[var(--muted)]">
                    {sourceNames.get(document.source_id) ?? `Source #${document.source_id}`} - {chunkCounts.get(document.id) ?? 0} chunks
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-[var(--card-2)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Recent ask sessions</div>
              <div className="mt-1 text-xs text-[var(--muted)]">What questions have been asked?</div>
            </div>
            <Link href="/ask-sessions" className="rounded-md border bg-white/6 px-3 py-1.5 text-xs hover:bg-white/10">
              View all
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="mt-4 rounded-lg border bg-black/10 p-4 text-sm text-[var(--muted)]">
              No activity yet. Ask a question to create a saved retrieval session.
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {recent.map((s) => (
                <Link key={s.id} href={`/ask-sessions/${s.id}`} className="rounded-lg border bg-black/10 p-3 hover:bg-white/5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-[var(--muted)]">Session #{s.id}</div>
                    <div className="text-[10px] text-[var(--muted)]">{formatDateTime(s.created_at)}</div>
                  </div>
                  <div className="mt-2 line-clamp-2 text-sm">{s.question}</div>
                  <div className="mt-3">
                    <Badge variant={s.answer ? "success" : "muted"}>{s.answer ? "Answered" : "Retrieved"}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
