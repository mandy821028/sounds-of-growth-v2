import {getRequestConfig} from "next-intl/server";
import {SUPPORTED_LOCALES, DEFAULT_LOCALE} from "@/i18n/config";

export default getRequestConfig(async ({ locale }) => {
	const lc = (locale || "").toLowerCase();
	const normalized = (SUPPORTED_LOCALES as readonly string[]).includes(lc) ? lc : DEFAULT_LOCALE;
	const messages = normalized === "es"
		? (await import("@/messages/es.json")).default
		: (await import("@/messages/en.json")).default;
	return {
		locale: normalized,
		messages,
	};
});

