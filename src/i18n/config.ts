export const SUPPORTED_LOCALES = ["en", "es"] as const;
export type AppLocale = typeof SUPPORTED_LOCALES[number];
export const DEFAULT_LOCALE: AppLocale = "en";

export function normalizeLocale(input?: string | null): AppLocale {
	const lc = (input || "").toLowerCase();
	if (lc.startsWith("es")) return "es";
	return "en";
}

