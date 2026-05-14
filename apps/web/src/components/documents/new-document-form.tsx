"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createApiClient } from "@/lib/api/client";
import type { KnowledgeSource } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function NewDocumentForm({
  sources,
  preselectedSourceId,
}: {
  sources: KnowledgeSource[];
  preselectedSourceId?: number;
}) {
  const router = useRouter();
  const [sourceId, setSourceId] = useState<number | "">(preselectedSourceId ?? "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourceOptions = useMemo(() => sources, [sources]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const sid = typeof sourceId === "number" ? sourceId : Number(sourceId);
      if (!Number.isFinite(sid)) {
        setError("Please select a source.");
        return;
      }
      const api = createApiClient();
      const doc = await api.post<{ id: number }>("/api/documents", {
        source_id: sid,
        title: title.trim(),
        content: content.trim(),
      });
      router.push(`/documents/${doc.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create document");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border bg-[var(--card-2)] p-4">
      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-xs text-[var(--muted)]">Source</span>
          <select
            className="h-10 rounded-md border bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value ? Number(e.target.value) : "")}
            required
          >
            <option value="" disabled>
              Select a source...
            </option>
            {sourceOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} (#{s.id})
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-xs text-[var(--muted)]">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title (required)"
            className="h-10 rounded-md border bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs text-[var(--muted)]">Content</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Manual text content for the public demo..."
            className="min-h-[220px] rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
            required
          />
        </label>

        {error ? <div className="text-sm text-red-300">{error}</div> : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={submitting || sourceOptions.length === 0}
            className={cn(
              "h-10 rounded-md border bg-white/6 px-4 text-sm hover:bg-white/10",
              (submitting || sourceOptions.length === 0) && "opacity-60"
            )}
          >
            {submitting ? "Creating..." : "Create document"}
          </button>
          <Link
            href="/documents"
            className="inline-flex h-10 items-center justify-center rounded-md border bg-white/6 px-4 text-sm hover:bg-white/10"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
