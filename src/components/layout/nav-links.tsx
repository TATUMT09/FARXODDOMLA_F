"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        if (!item.enabled) {
          return (
            <div
              key={item.href}
              className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground/50"
              title="Tez orada"
            >
              <span>{item.label}</span>
              <span className="text-xs">tez orada</span>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
