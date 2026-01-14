"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; disabled?: boolean; badge?: string | number };
type NavSection = { title?: string; items: NavItem[] };

export function SideNav({ sections }: { sections: NavSection[] }) {
	const pathname = usePathname();
	return (
		<nav className="rounded-lg border border-default bg-secondary/50 overflow-hidden">
			{sections.map((sec, idx) => (
				<div key={idx} className={cn("divide-y divide-[color-mix(in oklab,var(--border) 80%,transparent)]")}>
					{sec.title && (
						<div className="px-3 py-2 text-xs uppercase tracking-wide text-muted">{sec.title}</div>
					)}
					<ul className="flex flex-col">
						{sec.items.map((it, i) => {
							const active = it.href && (pathname === it.href || pathname.startsWith(it.href + "/"));
							return it.disabled ? (
								<li key={i} className="px-3 py-2 text-sm text-muted opacity-60">{it.label}</li>
							) : (
								<li key={i}>
									<Link
										href={it.href}
										aria-current={active ? "page" : undefined}
										className={cn(
											"group flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-none",
											"hover:bg-primary/10",
											active ? "bg-primary/15 text-foreground" : "text-foreground"
										)}
									>
										<span>{it.label}</span>
										{it.badge !== undefined && it.badge !== null && (
											<span className="text-xs bg-primary/20 text-foreground rounded px-2 py-0.5">{it.badge}</span>
										)}
									</Link>
								</li>
							);
						})}
					</ul>
				</div>
			))}
		</nav>
	);
}

