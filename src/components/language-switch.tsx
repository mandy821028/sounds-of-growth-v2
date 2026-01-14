"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function LanguageSwitch() {
	const t = useTranslations("common");
	const [locale, setLocale] = useState<"en"|"es">("en");

	useEffect(() => {
		// Hydration fix: read cookie on client and sync selected chip
		const m = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )locale=([^;]+)/) : null;
		const v = m?.[1] === "es" ? "es" : "en";
		if (v !== locale) setLocale(v);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function setCookie(next: "en"|"es") {
		document.cookie = `locale=${next}; path=/`;
		setLocale(next);
		try { window.dispatchEvent(new CustomEvent("locale-change", { detail: next })); } catch {}
		// Refresh to re-render server components
		if (typeof window !== "undefined") window.location.reload();
	}

	return (
		<div className="inline-flex items-center" role="group" aria-label={t("language")}>
			<div className="inline-flex items-center rounded-full border border-default bg-secondary p-1">
				<button
					type="button"
					className={cn("px-3 py-1 text-sm rounded-full transition", locale==="es" ? "bg-primary text-black" : "text-muted")}
					onClick={() => setCookie("es")}
					aria-pressed={locale==="es"}
				>
					ES
				</button>
				<button
					type="button"
					className={cn("px-3 py-1 text-sm rounded-full transition", locale==="en" ? "bg-primary text-black" : "text-muted")}
					onClick={() => setCookie("en")}
					aria-pressed={locale==="en"}
				>
					EN
				</button>
			</div>
		</div>
	);
}

