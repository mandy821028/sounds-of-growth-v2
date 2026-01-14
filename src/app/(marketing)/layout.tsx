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
			<footer className="border-t py-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} Sounds of Growth</footer>
		</div>
	);
}


