"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { askQuestion } from "@/lib/api/ask";
import type { RetrieveMatch } from "@/lib/api/retrieve";
import { cn } from "@/lib/utils";

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [matches, setMatches] = useState<RetrieveMatch[] | null>(null);

  const canSubmit = useMemo(() => question.trim().length > 0 && !loading, [question, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnswer(null);
    setMatches(null);
    try {
      const res = await askQuestion({ question: question.trim(), top_k: topK });
      setAnswer(res.answer);
      setMatches(res.matches);
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
        <p className="text-sm text-[var(--muted)]">
          Generates a grounded response using retrieved chunks from indexed knowledge. This is a
          standalone portfolio demo (no tools, browsing, or external data).
        </p>
      </header>

      <section className="rounded-xl border bg-[var(--card-2)] p-4">
        <form onSubmit={onSubmit} className="grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs text-[var(--muted)]">Question</span>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your manual knowledge..."
              className="h-10 rounded-md border bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
              required
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-[var(--muted)]">Top K</span>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="h-10 rounded-md border bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
            >
              {[3, 5, 8, 10].map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>

          {error ? (
            <div className="text-sm text-red-300">{error}</div>
          ) : (
            <div className="text-xs text-[var(--muted)]">
              Requires `OPENAI_API_KEY` for embeddings and answer generation.
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
            {loading ? "Asking..." : "Ask"}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Answer</div>
          <Badge>Grounded</Badge>
        </div>

        {answer ? (
          <div className="rounded-xl border bg-[var(--card-2)] p-4 text-sm whitespace-pre-wrap">
            {answer}
          </div>
        ) : (
          <div className="rounded-xl border bg-[var(--card-2)] p-4 text-sm text-[var(--muted)]">
            Ask a question to generate a grounded answer.
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Retrieved chunks</div>
          <div className="text-xs text-[var(--muted)]">
            {matches ? `${matches.length} results` : "—"}
          </div>
        </div>

        {matches && matches.length === 0 ? (
          <div className="rounded-xl border bg-[var(--card-2)] p-4 text-sm text-[var(--muted)]">
            No matches found. Index a document first.
          </div>
        ) : null}

        {matches && matches.length > 0 ? (
          <div className="grid gap-3">
            {matches.map((m) => (
              <div key={m.chunk_id} className="rounded-xl border bg-[var(--card-2)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">
                    Doc #{m.document_id}
                    {m.document_title ? `: ${m.document_title}` : ""} — Chunk #{m.chunk_id}
                  </div>
                  <div className="text-xs text-[var(--muted)]">score: {m.score.toFixed(3)}</div>
                </div>
                <div className="mt-3 whitespace-pre-wrap text-sm text-[var(--muted)]">
                  {m.chunk_text}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

