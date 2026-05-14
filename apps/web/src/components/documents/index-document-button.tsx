"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createApiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export function IndexDocumentButton({ documentId }: { documentId: number }) {
  const router = useRouter();
  const [indexing, setIndexing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  async function onIndex() {
    setIndexing(true);
    setMessage(null);
    try {
      const api = createApiClient();
      const res = await api.post<{ chunk_count: number }>(`/api/documents/${documentId}/index`);
      setMessage({ type: "success", text: `Indexed ${res.chunk_count} chunks.` });
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Indexing failed",
      });
    } finally {
      setIndexing(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={onIndex}
        disabled={indexing}
        className={cn(
          "h-10 rounded-md border bg-white/6 px-4 text-sm hover:bg-white/10",
          indexing && "opacity-60"
        )}
      >
        {indexing ? "Indexing..." : "Index document"}
      </button>

      {message ? (
        <div
          className={cn(
            "rounded-lg border p-3 text-sm",
            message.type === "success"
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
              : "border-red-400/30 bg-red-400/10 text-red-200"
          )}
        >
          {message.text}
        </div>
      ) : null}
    </div>
  );
}
