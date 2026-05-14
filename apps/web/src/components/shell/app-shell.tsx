import Link from "next/link";
import { TopNav } from "@/components/nav/top-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b bg-[var(--card)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="text-sm font-semibold tracking-wide">
              ContextFlow
            </Link>
            <span className="rounded-md border bg-[var(--card-2)] px-2 py-1 text-[10px] text-[var(--muted)]">
              Showcase
            </span>
          </div>

          <TopNav />
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="rounded-xl border bg-[var(--card)] p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
