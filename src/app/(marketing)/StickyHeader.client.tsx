"use client";
import Link from "next/link";
import AuthNav from "@/components/auth-nav";
import ThemeSwitch from "@/components/theme-switch";
import LanguageSwitch from "@/components/language-switch";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

export default function StickyHeader() {
	const [shrunk, setShrunk] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	const fallbackNav = useMemo(
		() => ({
			about: "About",
			services: "Services",
			blog: "Blog",
			contact: "Contact",
			getStarted: "Get started",
			menu: "Menu",
			openMenu: "Open menu",
			closeMenu: "Close menu",
		}),
		[]
	);

	let t: (key: string) => string = (key) => (fallbackNav as any)[key] ?? key;
	try {
		// next-intl throws when the namespace is missing; fall back gracefully
		t = useTranslations("marketingNav");
	} catch {}

	const { status } = useSession();
	const isLoggedIn = status === "authenticated";

	const navItems = [
		{ href: "/#about", label: t("about") },
		{ href: "/#services", label: t("services") },
		{ href: "/blog", label: t("blog") },
		{ href: "/#contact", label: t("contact") },
	];

	useEffect(() => {
		let ticking = false;
		const onScroll = () => {
			const y = window.scrollY || 0;
			if (ticking) return;
			ticking = true;
			window.requestAnimationFrame(() => {
				// Hysteresis avoids flicker caused by layout shift when header height changes.
				// - shrink only after a bit more scroll
				// - expand only when we're really close to top again
				setShrunk((prev) => {
					if (!prev && y > 72) return true;
					if (prev && y < 24) return false;
					return prev;
				});
				ticking = false;
			});
		};
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		if (!mobileOpen) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setMobileOpen(false);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [mobileOpen]);

	return (
		<header className="sticky top-0 z-50 border-b border-border/60 bg-card/90 backdrop-blur-md shadow-sm shadow-primary/[0.04]">
			<div
				className={cn(
					"max-w-6xl mx-auto px-6 transition-all duration-300 flex items-center justify-between",
					shrunk ? "h-14" : "h-20"
				)}
			>
				<Link href="/" aria-label="Sounds of Growth" className="flex items-center gap-2 shrink-0">
					<img
						src="/logo_animated.svg"
						alt="Sounds of Growth"
						className={`w-auto transition-all duration-300 ${shrunk ? "h-12" : "h-16"}`}
					/>
				</Link>

				{/* Center nav (desktop) */}
				<nav className="hidden md:flex items-center gap-7">
					{navItems.map((it) => (
						<Link
							key={it.href}
							href={it.href}
							className="group relative font-body text-sm text-muted-foreground transition-colors duration-150 hover:text-primary"
						>
							{it.label}
							<span className="pointer-events-none absolute -bottom-1 left-0 h-px w-0 bg-teal-bright transition-all duration-300 group-hover:w-full" style={{ background: "var(--teal-bright)" }} />
						</Link>
					))}
				</nav>

				{/* Right controls */}
				<div className="flex items-center gap-3">
					{!isLoggedIn && (
						<Button asChild size="sm" className="hidden sm:inline-flex">
							<Link href="/#contact">{t("getStarted")}</Link>
						</Button>
					)}
					<AuthNav />
					<div className="hidden sm:flex items-center gap-2">
						<div className="h-4 w-px bg-border/60" />
						<ThemeSwitch />
						<LanguageSwitch />
					</div>
					<Button
						type="button"
						variant="outline"
						size="icon"
						className="md:hidden"
						onClick={() => setMobileOpen(true)}
						aria-label={t("openMenu")}
						aria-haspopup="dialog"
						aria-expanded={mobileOpen}
					>
						<Menu className="size-4" />
					</Button>
				</div>
			</div>

			{/* Mobile sheet */}
			<div
				className={cn(
					"fixed inset-0 z-50 md:hidden transition",
					mobileOpen ? "pointer-events-auto" : "pointer-events-none"
				)}
				aria-hidden={!mobileOpen}
			>
				<div
					className={cn(
						"absolute inset-0 bg-black/40 transition-opacity duration-200",
						mobileOpen ? "opacity-100" : "opacity-0"
					)}
					onClick={() => setMobileOpen(false)}
				/>
				<div
					role="dialog"
					aria-modal="true"
					aria-label={t("menu")}
					className={cn(
						"absolute right-0 top-0 h-full w-[min(22rem,86vw)] border-l border-border/60 bg-card/95 backdrop-blur-lg shadow-2xl transition-transform duration-300",
						mobileOpen ? "translate-x-0" : "translate-x-full"
					)}
				>
					<div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
						<span className="font-heading text-lg font-medium text-foreground">
							Sounds of Growth
						</span>
						<Button
							type="button"
							variant="outline"
							size="icon"
							onClick={() => setMobileOpen(false)}
							aria-label={t("closeMenu")}
						>
							<X className="size-4" />
						</Button>
					</div>

					<div className="px-4 py-5 flex flex-col gap-1">
						{navItems.map((it) => (
							<Link
								key={it.href}
								href={it.href}
								onClick={() => setMobileOpen(false)}
								className="rounded-xl px-4 py-3 font-body text-sm text-muted-foreground hover:text-primary hover:bg-accent/60 transition-colors duration-150"
							>
								{it.label}
							</Link>
						))}

						{!isLoggedIn && (
							<Button asChild className="mt-3">
								<Link href="/#contact" onClick={() => setMobileOpen(false)}>
									{t("getStarted")}
								</Link>
							</Button>
						)}

						<div className="mt-4 flex items-center gap-3 px-1">
							<ThemeSwitch />
							<LanguageSwitch />
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}

