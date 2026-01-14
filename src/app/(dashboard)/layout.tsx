import Link from "next/link";
import AuthNav from "@/components/auth-nav";
import LanguageSwitch from "@/components/language-switch";
import ThemeSwitch from "@/components/theme-switch";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b border-default relative z-10">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between bg-gradient-to-b from-[rgba(0,151,178,0.08)] to-transparent rounded-b-lg">
                    <Link href="/" aria-label="Sounds of Growth" className="flex items-center gap-2">
                        <img src="/logo_animated.svg" alt="" className="h-14 w-auto p-1" />
                    </Link>
                    <nav className="flex items-center gap-4">
                        <AuthNav />
                        <ThemeSwitch />
                        <LanguageSwitch />
                    </nav>
                </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t py-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} Sounds of Growth</footer>
        </div>
    );
}


