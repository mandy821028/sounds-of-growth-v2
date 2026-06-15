import Link from "next/link";
import AuthNav from "@/components/auth-nav";
import LanguageSwitch from "@/components/language-switch";
import ThemeSwitch from "@/components/theme-switch";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <header className="sticky top-0 z-50 border-b border-border/60 bg-card/90 backdrop-blur-md shadow-sm shadow-primary/[0.04]">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" aria-label="Sounds of Growth" className="flex items-center gap-2 shrink-0">
                        <img src="/logo_animated.svg" alt="Sounds of Growth" className="h-12 w-auto" />
                    </Link>
                    <nav className="flex items-center gap-3">
                        <AuthNav />
                        <div className="h-5 w-px bg-border/60" />
                        <ThemeSwitch />
                        <LanguageSwitch />
                    </nav>
                </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border/50 py-6 text-center font-body text-sm text-muted-foreground bg-secondary/30">
                © {new Date().getFullYear()} Sounds of Growth
            </footer>
        </div>
    );
}


