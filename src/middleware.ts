import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { normalizeLocale } from "./i18n/config";

const PROTECTED_PREFIXES = ["/super-admin", "/teacher", "/student", "/calendar", "/account", "/me"];
const CHANGE_PASSWORD_PATH = "/account/change-password";

export async function middleware(req: NextRequest) {
	const { nextUrl } = req;
	const pathname = nextUrl.pathname || "/";

	// ── Auth guard for protected routes ─────────────────────────────────────
	const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
	if (isProtected) {
		const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

		if (!token) {
			const loginUrl = new URL("/login", req.url);
			loginUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(loginUrl);
		}

		// Force password change before accessing anything else
		if ((token as { mustChangePassword?: boolean }).mustChangePassword && pathname !== CHANGE_PASSWORD_PATH) {
			return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, req.url));
		}

		// Role-based access control
		const role = (token as { role?: string }).role;
		if (pathname.startsWith("/super-admin") && role !== "SUPER_ADMIN") {
			return NextResponse.redirect(new URL("/login", req.url));
		}
		if (pathname.startsWith("/teacher") && role !== "TEACHER" && role !== "SUPER_ADMIN") {
			return NextResponse.redirect(new URL("/login", req.url));
		}
		if (pathname.startsWith("/student") && role !== "STUDENT" && role !== "SUPER_ADMIN") {
			return NextResponse.redirect(new URL("/login", req.url));
		}
	}

	// ── Locale URL prefix rewrites ───────────────────────────────────────────
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

	// Allow switching locale via ?lang= param
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
	// Set default theme cookie if not present
	const themeCookie = req.cookies.get("theme")?.value;
	if (!themeCookie) {
		res.cookies.set("theme", "dark", { path: "/" });
	}
	return res;
}

export const config = {
	matcher: ["/((?!api|_next|.*\\..*).*)"],
};

