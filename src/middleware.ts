import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
	const res = NextResponse.next();
	// Set default locale cookie if not present
	const localeCookie = req.cookies.get("locale")?.value;
	if (!localeCookie) {
		res.cookies.set("locale", "en", { path: "/" });
	}
	// Allow switching via ?lang= param
	const langParam = req.nextUrl.searchParams.get("lang");
	if (langParam === "en" || langParam === "es") {
		res.cookies.set("locale", langParam, { path: "/" });
	}
	return res;
}

export const config = {
	matcher: ["/((?!api|_next|.*\\..*).*)"],
};


