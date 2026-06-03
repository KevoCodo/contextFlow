import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { AskSession } from "@/lib/api/types";
import { serverGet } from "@/lib/api/server";
import { formatDateTime } from "@/lib/format";

type RetrievedChunk = {
  chunk_id?: number;
  document_id?: number;
  document_title?: string | null;
  source_id?: number;
  source_title?: string | null;
  chunk_index?: number;
  chunk_text?: string;
  score?: number;
  metadata?: Record<string, unknown> | null;
};

type RetrievalSettings = {
  mode: "retrieval_only" | "grounded_answer" | "unknown";
  top_k?: number;
  source_id?: number | null;
  source_title?: string | null;
};

async function fetchSession(sessionId: number): Promise<AskSession> {
  return serverGet<AskSession>(`/api/ask-sessions/${sessionId}`);
}

function normalizeChunk(value: Record<string, unknown>): RetrievedChunk {
  return {
    chunk_id: typeof value.chunk_id === "number" ? value.chunk_id : undefined,
    document_id: typeof value.document_id === "number" ? value.document_id : undefined,
    document_title: typeof value.document_title === "string" ? value.document_title : null,
    source_id: typeof value.source_id === "number" ? value.source_id : undefined,
    source_title: typeof value.source_title === "string" ? value.source_title : null,
    chunk_index: typeof value.chunk_index === "number" ? value.chunk_index : undefined,
    chunk_text: typeof value.chunk_text === "string" ? value.chunk_text : undefined,
    score: typeof value.score === "number" ? value.score : undefined,
    metadata:
      value.metadata && typeof value.metadata === "object" && !Array.isArray(value.metadata)
        ? (value.metadata as Record<string, unknown>)
        : null,
  };
}

function normalizeSettings(value: Record<string, unknown> | null): RetrievalSettings {
  if (!value) return { mode: "unknown" };

  return {
    mode:
      value.mode === "retrieval_only" || value.mode === "grounded_answer"
        ? value.mode
        : "unknown",
    top_k: typeof value.top_k === "number" ? value.top_k : undefined,
    source_id: typeof value.source_id === "number" ? value.source_id : null,
    source_title: typeof value.source_title === "string" ? value.source_title : null,
  };
}

export default async function AskSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionId = Number(id);

  if (!Number.isFinite(sessionId)) {
    return (
      <div className="rounded-xl border bg-[var(--card-2)] p-4 text-sm text-red-300">
        Invalid ask session id.
      </div>
    );
  }

  const session = await fetchSession(sessionId);
  const chunks = Array.isArray(session.retrieved_chunks)
    ? session.retrieved_chunks.map(normalizeChunk)
    : [];
  const settings = normalizeSettings(session.retrieval_settings);
  const modeLabel =
    settings.mode === "retrieval_only"
      ? "Retrieval Only"
      : settings.mode === "grounded_answer"
        ? "Grounded Answer"
        : session.answer
          ? "Grounded Answer"
          : "Retrieval Only";

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Ask Session #{session.id}</h1>
            <div className="mt-1 text-sm text-[var(--muted)]">
              Created: {formatDateTime(session.created_at)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={session.answer ? "success" : "muted"}>
              {modeLabel}
            </Badge>
            <Badge>{chunks.length} chunks</Badge>
          </div>
        </div>
        <Link
          href="/ask-sessions"
          className="inline-flex w-fit items-center justify-center rounded-md border bg-white/6 px-3 py-1.5 text-xs hover:bg-white/10"
        >
          Back to sessions
        </Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-[var(--card-2)] p-4">
          <div className="text-xs text-[var(--muted)]">Mode</div>
          <div className="mt-2 text-sm font-medium">{modeLabel}</div>
          <div className="mt-1 text-xs text-[var(--muted)]">
            {modeLabel === "Retrieval Only" ? "No answer generation" : "Uses retrieved context"}
          </div>
        </div>
        <div className="rounded-xl border bg-[var(--card-2)] p-4">
          <div className="text-xs text-[var(--muted)]">Top K</div>
          <div className="mt-2 text-sm font-medium">{settings.top_k ?? "Unknown"}</div>
          <div className="mt-1 text-xs text-[var(--muted)]">Requested chunk limit</div>
        </div>
        <div className="rounded-xl border bg-[var(--card-2)] p-4">
          <div className="text-xs text-[var(--muted)]">Source filter</div>
          <div className="mt-2 text-sm font-medium">
            {settings.source_title ?? (settings.source_id ? `Source #${settings.source_id}` : "All Sources")}
          </div>
          <div className="mt-1 text-xs text-[var(--muted)]">Search scope used</div>
        </div>
      </section>

      <section className="rounded-xl border bg-[var(--card-2)] p-4">
        <div className="text-xs text-[var(--muted)]">Question</div>
        <div className="mt-2 whitespace-pre-wrap text-sm leading-6">{session.question}</div>
      </section>

      <section className="rounded-xl border bg-[var(--card-2)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium">Answer</div>
          <Badge>{session.answer ? "Grounded output" : "No answer saved"}</Badge>
        </div>
        {session.answer ? (
          <div className="mt-3 whitespace-pre-wrap rounded-lg border bg-black/10 p-3 text-sm leading-6">
            {session.answer}
          </div>
        ) : (
          <div className="mt-3 text-sm text-[var(--muted)]">
            This saved run contains retrieved context without a generated answer.
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium">Retrieved chunks</div>
          <div className="text-xs text-[var(--muted)]">{chunks.length} source references</div>
        </div>

        {chunks.length === 0 ? (
          <div className="rounded-xl border bg-[var(--card-2)] p-6">
            <div className="text-sm font-medium">No retrieved chunks saved</div>
            <div className="mt-1 text-sm text-[var(--muted)]">
              Ask sessions will show chunk references after retrieval runs.
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {chunks.map((chunk, index) => (
              <div key={`${chunk.chunk_id ?? "chunk"}-${index}`} className="rounded-xl border bg-[var(--card-2)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">
                      {chunk.document_title ?? `Document #${chunk.document_id ?? "unknown"}`}
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      {chunk.source_title ?? `Source #${chunk.source_id ?? "unknown"}`} - Document #
                      {chunk.document_id ?? "unknown"} - Chunk {chunk.chunk_index ?? chunk.chunk_id ?? "unknown"}
                    </div>
                  </div>
                  {typeof chunk.score === "number" ? (
                    <Badge variant="success">score {chunk.score.toFixed(3)}</Badge>
                  ) : null}
                </div>
                <div className="mt-3 whitespace-pre-wrap rounded-lg border bg-black/10 p-3 text-sm leading-6 text-[var(--muted)]">
                  {chunk.chunk_text ?? "Chunk text was not saved in this session payload."}
                </div>
                {chunk.metadata ? (
                  <div className="mt-3 text-xs text-[var(--muted)]">
                    Metadata:{" "}
                    {Object.entries(chunk.metadata)
                      .map(([key, value]) => `${key}: ${String(value)}`)
                      .join(" | ")}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
