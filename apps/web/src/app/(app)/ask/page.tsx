"use client";

import { useEffect, useMemo, useState } from "react";
import { askQuestion } from "@/lib/api/ask";
import { listSources } from "@/lib/api/sources";
import type { KnowledgeSource } from "@/lib/api/types";
import type { RetrieveMatch } from "@/lib/api/retrieve";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AskMode = "grounded_answer" | "retrieval_only";

function formatScore(score: number) {
  return score.toFixed(3);
}

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [sourceId, setSourceId] = useState<string>("all");
  const [topK, setTopK] = useState(5);
  const [mode, setMode] = useState<AskMode>("grounded_answer");
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [matches, setMatches] = useState<RetrieveMatch[] | null>(null);
  const [lastRun, setLastRun] = useState<{
    mode: AskMode;
    topK: number;
    sourceLabel: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSources() {
      try {
        const res = await listSources();
        if (active) setSources(res.items);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load sources");
      } finally {
        if (active) setSourcesLoading(false);
      }
    }

    loadSources();
    return () => {
      active = false;
    };
  }, []);

  const selectedSource = useMemo(
    () => sources.find((source) => String(source.id) === sourceId),
    [sourceId, sources]
  );
  const canSubmit = useMemo(() => question.trim().length > 0 && !loading, [question, loading]);
  const isRetrievalOnly = mode === "retrieval_only";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnswer(null);
    setMatches(null);

    try {
      const numericSourceId = sourceId === "all" ? undefined : Number(sourceId);
      const res = await askQuestion({
        question: question.trim(),
        top_k: topK,
        source_id: numericSourceId,
        retrieval_only: isRetrievalOnly,
      });
      setAnswer(res.answer);
      setMatches(res.matches);
      setLastRun({
        mode,
        topK,
        sourceLabel: selectedSource?.title ?? "All Sources",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ask failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Ask Assistant</h1>
        <p className="max-w-3xl text-sm text-[var(--muted)]">
          Tune a lightweight RAG request: choose the source scope, retrieve a selected number of
          chunks, then either inspect retrieval results or generate a grounded answer.
        </p>
      </header>

      <section className="rounded-xl border bg-[var(--card-2)] p-4">
        <form onSubmit={onSubmit} className="grid gap-4">
          <label className="grid gap-1">
            <span className="text-xs text-[var(--muted)]">Question</span>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about indexed knowledge..."
              className="min-h-11 rounded-md border bg-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
              required
            />
          </label>

          <div className="grid gap-3 lg:grid-cols-[1fr_160px]">
            <label className="grid gap-1">
              <span className="text-xs text-[var(--muted)]">Source filter</span>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="h-10 rounded-md border bg-black/10 px-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
                disabled={sourcesLoading}
              >
                <option value="all">All Sources</option>
                {sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-[var(--muted)]">Top K</span>
              <select
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="h-10 rounded-md border bg-black/10 px-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
              >
                {[3, 5, 8, 10].map((k) => (
                  <option key={k} value={k}>
                    {k} chunks
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label
              className={cn(
                "cursor-pointer rounded-xl border bg-black/10 p-4",
                mode === "retrieval_only" && "border-emerald-400/40 bg-emerald-400/10"
              )}
            >
              <input
                type="radio"
                name="ask-mode"
                value="retrieval_only"
                checked={mode === "retrieval_only"}
                onChange={() => setMode("retrieval_only")}
                className="sr-only"
              />
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">Retrieval Only</div>
                <Badge variant={mode === "retrieval_only" ? "success" : "muted"}>No answer</Badge>
              </div>
              <div className="mt-2 text-xs leading-5 text-[var(--muted)]">
                Returns the most relevant chunks without generating a final answer.
              </div>
            </label>

            <label
              className={cn(
                "cursor-pointer rounded-xl border bg-black/10 p-4",
                mode === "grounded_answer" && "border-emerald-400/40 bg-emerald-400/10"
              )}
            >
              <input
                type="radio"
                name="ask-mode"
                value="grounded_answer"
                checked={mode === "grounded_answer"}
                onChange={() => setMode("grounded_answer")}
                className="sr-only"
              />
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">Grounded Answer</div>
                <Badge variant={mode === "grounded_answer" ? "success" : "muted"}>Answer</Badge>
              </div>
              <div className="mt-2 text-xs leading-5 text-[var(--muted)]">
                Generates an answer using retrieved context and includes source references.
              </div>
            </label>
          </div>

          <div className="rounded-lg border bg-black/10 p-3 text-xs leading-5 text-[var(--muted)]">
            Question - Retrieve chunks from {selectedSource?.title ?? "all sources"} -{" "}
            {isRetrievalOnly ? "Return source chunks" : "Generate grounded answer"} - Show sources.
          </div>

          {error ? (
            <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
              {error}
            </div>
          ) : (
            <div className="text-xs text-[var(--muted)]">
              Requires `OPENAI_API_KEY` for question embeddings. Grounded Answer also calls chat
              completion.
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "h-10 rounded-md border bg-white/6 px-4 text-sm hover:bg-white/10",
              !canSubmit && "opacity-60"
            )}
          >
            {loading ? "Running retrieval..." : isRetrievalOnly ? "Retrieve Chunks" : "Generate Answer"}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-medium">Run output</div>
          {lastRun ? (
            <div className="flex flex-wrap gap-2">
              <Badge>{lastRun.sourceLabel}</Badge>
              <Badge>{lastRun.topK} top-K</Badge>
              <Badge variant={lastRun.mode === "grounded_answer" ? "success" : "muted"}>
                {lastRun.mode === "grounded_answer" ? "Grounded Answer" : "Retrieval Only"}
              </Badge>
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="rounded-xl border bg-[var(--card-2)] p-4 text-sm text-[var(--muted)]">
            Retrieving chunks{isRetrievalOnly ? "..." : " and generating a grounded answer..."}
          </div>
        ) : answer ? (
          <div className="whitespace-pre-wrap rounded-xl border bg-[var(--card-2)] p-5 text-sm leading-6">
            {answer}
          </div>
        ) : matches ? (
          <div className="rounded-xl border bg-[var(--card-2)] p-4 text-sm text-[var(--muted)]">
            Retrieval-only run complete. Review the source chunks below.
          </div>
        ) : (
          <div className="rounded-xl border bg-[var(--card-2)] p-4 text-sm text-[var(--muted)]">
            Ask a question to run retrieval.
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Retrieved chunks</div>
          <div className="text-xs text-[var(--muted)]">
            {matches ? `${matches.length} results` : "Not run"}
          </div>
        </div>

        {matches && matches.length === 0 ? (
          <div className="rounded-xl border bg-[var(--card-2)] p-4 text-sm text-[var(--muted)]">
            No matches found. Index a document first or choose a different source.
          </div>
        ) : null}

        {matches && matches.length > 0 ? (
          <div className="grid gap-3">
            {matches.map((m) => (
              <div key={m.chunk_id} className="rounded-xl border bg-[var(--card-2)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{m.document_title ?? `Document #${m.document_id}`}</div>
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      {m.source_title ?? `Source #${m.source_id}`} - Document #{m.document_id} - Chunk{" "}
                      {m.chunk_index}
                    </div>
                  </div>
                  <Badge variant="success">Score: {formatScore(m.score)}</Badge>
                </div>
                <div className="mt-3 whitespace-pre-wrap rounded-lg border bg-black/10 p-3 text-sm leading-6 text-[var(--muted)]">
                  {m.chunk_text}
                </div>
                {m.metadata ? (
                  <div className="mt-3 text-xs text-[var(--muted)]">
                    Metadata:{" "}
                    {Object.entries(m.metadata)
                      .map(([key, value]) => `${key}: ${String(value)}`)
                      .join(" | ")}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
