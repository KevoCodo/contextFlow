"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { updateSource } from "@/lib/api/sources";
import type { KnowledgeSource } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function EditSourceForm({ source }: { source: KnowledgeSource }) {
  const router = useRouter();
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(source.title);
  const [description, setDescription] = useState(source.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      titleInputRef.current?.focus();
    }
  }, [editing]);

  function closeEditor() {
    setEditing(false);
    setTitle(source.title);
    setDescription(source.description ?? "");
    setError(null);
    window.requestAnimationFrame(() => editButtonRef.current?.focus());
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle) {
      setError("Source name is required.");
      titleInputRef.current?.focus();
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateSource(source.id, {
        title: trimmedTitle,
        description: trimmedDescription || null,
      });
      setEditing(false);
      setSuccess("Source updated.");
      router.refresh();
      window.requestAnimationFrame(() => editButtonRef.current?.focus());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update source");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        ref={editButtonRef}
        type="button"
        onClick={() => {
          setSuccess(null);
          setError(null);
          setEditing(true);
        }}
        className="inline-flex h-9 items-center justify-center rounded-md border bg-white/6 px-3 text-xs hover:bg-white/10"
      >
        Edit source
      </button>

      {success && !editing ? (
        <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">
          {success}
        </div>
      ) : null}

      {editing ? (
        <form onSubmit={onSubmit} className="rounded-xl border bg-black/10 p-4">
          <div className="grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs text-[var(--muted)]">Source name</span>
              <input
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 rounded-md border bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
                required
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-[var(--muted)]">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[96px] rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
              />
            </label>

            {error ? (
              <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className={cn(
                  "h-10 rounded-md border bg-white/6 px-4 text-sm hover:bg-white/10",
                  saving && "opacity-60"
                )}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={closeEditor}
                disabled={saving}
                className={cn(
                  "h-10 rounded-md border bg-transparent px-4 text-sm hover:bg-white/6",
                  saving && "opacity-60"
                )}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}
