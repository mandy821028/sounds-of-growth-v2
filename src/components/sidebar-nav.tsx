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
    <nav className="rounded-[1.1rem] border border-border/60 bg-card shadow-sm shadow-primary/5 overflow-hidden">
      <ul className="divide-y divide-border/40">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <li key={it.href}>
              <Link
                href={it.disabled ? "#" : it.href}
                className={cn(
                  "flex items-center justify-between px-4 py-2.5 font-body text-sm transition-colors duration-150",
                  active
                    ? "bg-primary/10 text-primary font-medium border-l-2 border-primary pl-[14px]"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  it.disabled && "opacity-50 pointer-events-none"
                )}
              >
                <span>{it.label}</span>
                {typeof it.badgeCount === "number" && it.badgeCount > 0 && (
                  <span className="text-xs bg-primary/20 text-primary font-semibold rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
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

