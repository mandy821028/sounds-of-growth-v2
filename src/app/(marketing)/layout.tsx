import StickyHeader from "./StickyHeader.client";
import SocialFloat from "./SocialFloat";

export const dynamic = "force-dynamic";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen flex flex-col">
			<StickyHeader />
			<main className="flex-1">{children}</main>
			{/* Floating social icons */}
			<SocialFloat />
			<footer className="border-t border-border/50 py-6 text-center font-body text-sm text-muted-foreground bg-secondary/30">
				© {new Date().getFullYear()} Sounds of Growth
			</footer>
		</div>
	);
}


