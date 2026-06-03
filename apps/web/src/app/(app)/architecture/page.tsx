export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Architecture</h1>
        <p className="max-w-3xl text-sm text-[var(--muted)]">
          ContextFlow is intentionally small: a Next.js UI, a FastAPI backend, and PostgreSQL +
          pgvector for similarity search. The screens are arranged to make the RAG flow easy to
          explain in a portfolio walkthrough.
        </p>
      </header>

      <section className="rounded-xl border bg-[var(--card-2)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-medium">System diagram</div>
          <div className="text-xs text-[var(--muted)]">Manual ingest - chunk - embed - retrieve - answer</div>
        </div>
        <pre className="mt-3 overflow-x-auto rounded-lg border bg-black/10 p-3 text-xs text-[var(--muted)]">
{`Browser / Next.js UI
  -> FastAPI REST API
     -> PostgreSQL + pgvector
     -> Embedding service (OpenAI)
     -> Retrieval service (cosine similarity)
     -> Answer generation service (OpenAI, grounded)`}
        </pre>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-[var(--card-2)] p-4">
          <div className="text-sm font-medium">Frontend (Next.js)</div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
            <li>Manual source/document management UI</li>
            <li>Indexing trigger + chunk display</li>
            <li>Ask UI to display grounded answer + sources</li>
          </ul>
        </div>

        <div className="rounded-xl border bg-[var(--card-2)] p-4">
          <div className="text-sm font-medium">Backend (FastAPI)</div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
            <li>CRUD for sources and documents</li>
            <li>Indexing: chunk + embed per chunk</li>
            <li>Retrieval: pgvector similarity search</li>
            <li>Ask: answer generation constrained to retrieved context</li>
          </ul>
        </div>

        <div className="rounded-xl border bg-[var(--card-2)] p-4">
          <div className="text-sm font-medium">Database (PostgreSQL + pgvector)</div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
            <li>Stores sources, documents, chunks</li>
            <li>Stores chunk embeddings in a pgvector column</li>
            <li>Supports cosine similarity search over chunks</li>
          </ul>
        </div>

        <div className="rounded-xl border bg-[var(--card-2)] p-4">
          <div className="text-sm font-medium">RAG contract</div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
            <li>Answer is grounded in retrieved chunks</li>
            <li>When context is insufficient, respond with uncertainty</li>
            <li>Never fabricate citations; sources come from retrieval</li>
          </ul>
        </div>
      </section>

      <div className="rounded-xl border bg-[var(--card-2)] p-4 text-sm text-[var(--muted)]">
        Detailed responsibilities and design notes live in docs/ARCHITECTURE.md. The UI intentionally
        stays focused on demo clarity instead of production SaaS concerns.
      </div>
    </div>
  );
}
