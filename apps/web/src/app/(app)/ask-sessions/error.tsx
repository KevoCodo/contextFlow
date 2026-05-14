"use client";

export default function AskSessionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border bg-[var(--card-2)] p-4 text-sm text-red-300">
        {error.message || "Something went wrong while loading ask sessions."}
      </div>
      <button
        onClick={reset}
        className="rounded-md border bg-white/6 px-3 py-1.5 text-xs hover:bg-white/10"
      >
        Retry
      </button>
    </div>
  );
}

