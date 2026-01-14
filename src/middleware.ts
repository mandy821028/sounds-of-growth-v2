import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeLocale } from "./i18n/config";

export function middleware(req: NextRequest) {
	const { nextUrl } = req;
	const pathname = nextUrl.pathname || "/";

	// Allow /en/... or /es/... prefixes -> rewrite without prefix and set cookie
	if (pathname === "/en" || pathname.startsWith("/en/")) {
		const url = nextUrl.clone();
		url.pathname = pathname.replace(/^\/en(\/|$)/, "/");
		const res = NextResponse.rewrite(url);
		res.cookies.set("locale", "en", { path: "/" });
		return res;
	}
	if (pathname === "/es" || pathname.startsWith("/es/")) {
		const url = nextUrl.clone();
		url.pathname = pathname.replace(/^\/es(\/|$)/, "/");
		const res = NextResponse.rewrite(url);
		res.cookies.set("locale", "es", { path: "/" });
		return res;
	}

	const res = NextResponse.next();

	// Allow switching via ?lang= param
	const langParam = req.nextUrl.searchParams.get("lang");
	if (langParam === "en" || langParam === "es") {
		res.cookies.set("locale", langParam, { path: "/" });
		return res;
	}
	// Allow switching theme via ?theme= param
	const themeParam = req.nextUrl.searchParams.get("theme");
	if (themeParam === "dark" || themeParam === "light") {
		res.cookies.set("theme", themeParam, { path: "/" });
		return res;
	}

	// Set default locale cookie if not present, prefer Accept-Language
	const localeCookie = req.cookies.get("locale")?.value;
	if (!localeCookie) {
		const accept = req.headers.get("accept-language") || "";
		const preferred = normalizeLocale(accept.split(",")[0]?.trim());
		res.cookies.set("locale", preferred, { path: "/" });
	}
	// Set default theme cookie if not present (default dark)
	const themeCookie = req.cookies.get("theme")?.value;
	if (!themeCookie) {
		res.cookies.set("theme", "dark", { path: "/" });
	}
	return res;
}

export const config = {
	matcher: ["/((?!api|_next|.*\\..*).*)"],
};

