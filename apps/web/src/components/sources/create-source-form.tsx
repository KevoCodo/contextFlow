"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createApiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export function CreateSourceForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const api = createApiClient();
      await api.post("/api/sources", {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setTitle("");
      setDescription("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create source");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 grid gap-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (required)"
        className="h-10 rounded-md border bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="min-h-[88px] rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
      />
      {error ? <div className="text-sm text-red-300">{error}</div> : null}
      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "h-10 rounded-md border bg-white/6 px-4 text-sm hover:bg-white/10",
          submitting && "opacity-60"
        )}
      >
        {submitting ? "Creating..." : "Create source"}
      </button>
    </form>
  );
}
