import StickyHeader from "./StickyHeader.client";

export const dynamic = "force-dynamic";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen flex flex-col">
			<StickyHeader />
			<main className="flex-1">{children}</main>
			<footer className="border-t py-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} Sounds of Growth</footer>
		</div>
	);
}


