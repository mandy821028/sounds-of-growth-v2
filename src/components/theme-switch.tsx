"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export default function ThemeSwitch() {
	const t = useTranslations("common");
	const [theme, setTheme] = useState<"dark"|"light">("dark");

	// On mount, sync state with cookie to avoid SSR/hydration mismatch
	useEffect(() => {
		const m = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )theme=([^;]+)/) : null;
		const v: "dark"|"light" = m?.[1] === "light" ? "light" : "dark";
		if (v !== theme) setTheme(v);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Keep html class in sync without reload when theme changes
	useEffect(() => {
		if (typeof document === "undefined") return;
		const html = document.documentElement;
		html.classList.remove("theme-light", "theme-dark");
		html.classList.add(theme === "light" ? "theme-light" : "theme-dark");
	}, [theme]);

	function setCookie(next: "dark"|"light") {
		document.cookie = `theme=${next}; path=/`;
		setTheme(next);
		try { window.dispatchEvent(new CustomEvent("theme-change", { detail: next })); } catch {}
	}

	return (
		<div className="inline-flex items-center" role="group" aria-label={t("theme")}>
			<div className="inline-flex items-center rounded-full border border-default bg-secondary p-1">
				<button
					type="button"
					className={cn("px-3 py-1 text-sm rounded-full transition", theme==="dark" ? "bg-primary text-black" : "text-muted")}
					onClick={() => setCookie("dark")}
					aria-pressed={theme==="dark"}
				>
					{t("dark")}
				</button>
				<button
					type="button"
					className={cn("px-3 py-1 text-sm rounded-full transition", theme==="light" ? "bg-primary text-black" : "text-muted")}
					onClick={() => setCookie("light")}
					aria-pressed={theme==="light"}
				>
					{t("light")}
				</button>
			</div>
		</div>
	);
}

