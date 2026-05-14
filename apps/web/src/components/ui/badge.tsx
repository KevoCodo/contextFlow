import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "muted",
}: {
  children: React.ReactNode;
  variant?: "muted" | "success" | "warning" | "danger";
}) {
  const styles =
    variant === "success"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
      : variant === "warning"
        ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
        : variant === "danger"
          ? "border-red-400/30 bg-red-400/10 text-red-200"
          : "border-white/10 bg-black/10 text-[var(--muted)]";

  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-1 text-[10px]", styles)}>
      {children}
    </span>
  );
}

