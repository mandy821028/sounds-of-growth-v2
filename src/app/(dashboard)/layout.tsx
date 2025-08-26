import Link from "next/link";
import { cookies } from "next/headers";
import AuthNav from "@/components/auth-nav";
import LanguageMenu from "@/components/language-menu";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";
    const t = {
        language: locale === "es" ? "Idioma" : "Language",
        en: "English",
        es: "Español",
    };
    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b relative z-10">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href="/" className="font-semibold">Sounds of Growth</Link>
                    <nav className="flex items-center gap-4">
                        <AuthNav locale={locale} />
                        <LanguageMenu locale={locale} />
                    </nav>
                </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t py-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} Sounds of Growth</footer>
        </div>
    );
}


