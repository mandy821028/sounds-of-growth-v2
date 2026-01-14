"use client";
import Link from "next/link";
import AuthNav from "@/components/auth-nav";
import ThemeSwitch from "@/components/theme-switch";
import LanguageSwitch from "@/components/language-switch";
import { useEffect, useState } from "react";

export default function StickyHeader() {
	const [shrunk, setShrunk] = useState(false);

	useEffect(() => {
		const onScroll = () => setShrunk(window.scrollY > 10);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header className="sticky top-0 z-40 border-b border-default bg-gradient-to-b from-[rgba(0,151,178,0.08)] to-transparent backdrop-blur">
			<div className={`max-w-5xl mx-auto px-4 transition-all duration-300 ${shrunk ? "h-14" : "h-24"} flex items-center justify-between rounded-b-lg`}>
				<Link href="/" aria-label="Sounds of Growth" className="flex items-center gap-2">
					<img
						src="/logo_animated.svg"
						alt=""
						className={`w-auto transition-all duration-300 ${shrunk ? "h-14" : "h-20"}`}
					/>
				</Link>
				<nav className="flex items-center gap-4">
					<AuthNav />
					<ThemeSwitch />
					<LanguageSwitch />
				</nav>
			</div>
		</header>
	);
}

