"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type SidebarItem = {
  href: string;
  label: string;
  disabled?: boolean;
  badgeCount?: number;
};

export default function SidebarNav({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="rounded-md border border-default bg-secondary/30 overflow-hidden">
      <ul className="divide-y divide-[color:var(--border)]">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <li key={it.href}>
              <Link
                href={it.disabled ? "#" : it.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-sm transition",
                  "hover:bg-primary/10",
                  active && "bg-primary/15 border-l-2 border-primary pl-[10px]",
                  it.disabled && "opacity-60 pointer-events-none"
                )}
              >
                <span>{it.label}</span>
                {typeof it.badgeCount === "number" && it.badgeCount > 0 && (
                  <span className="text-xs bg-primary/20 text-foreground rounded px-2 py-0.5">
                    {it.badgeCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

