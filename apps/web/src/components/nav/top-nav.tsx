"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/components/nav/nav-items";
import { cn } from "@/lib/utils";

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-white/8 text-[var(--foreground)]"
                : "text-[var(--muted)] hover:bg-white/6 hover:text-[var(--foreground)]"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

