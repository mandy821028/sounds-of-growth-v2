import {getRequestConfig} from "next-intl/server";
import {SUPPORTED_LOCALES, DEFAULT_LOCALE} from "./src/i18n/config";

export default getRequestConfig(async ({ locale }) => {
	const lc = (locale || "").toLowerCase();
	const normalized = (SUPPORTED_LOCALES as readonly string[]).includes(lc) ? lc : DEFAULT_LOCALE;
	// Load messages from src/messages/{locale}.json
	// Note: We cast to any to satisfy TS with dynamic import.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const messages: any = (await import(`./src/messages/${normalized}.json`)).default;
	return {
		locale: normalized,
		messages,
	};
});

