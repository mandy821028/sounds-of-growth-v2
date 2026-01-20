import { prisma } from "@/lib/prisma";

export default async function SocialFloat() {
  // Don't break homepage if DB is out of sync (migrations/drift in dev).
  const links = await prisma.socialLink
    .findMany({
      where: { enabled: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    })
    .catch(() => []);
  if (links.length === 0) return null;
  return (
    <div className="fixed right-4 top-1/3 z-40 flex flex-col gap-3">
      {links.map((l) => (
        <a
          key={l.id}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full border border-default bg-card shadow hover:scale-105 transition flex items-center justify-center"
          aria-label={l.label}
          title={l.label}
        >
          {l.iconUrl ? (
            <img src={l.iconUrl} alt="" className="w-12 h-12 object-contain" />
          ) : (
            <span className="text-base font-medium">{iconFor(l.provider) ?? l.provider[0]}</span>
          )}
        </a>
      ))}
    </div>
  );
}

function iconFor(provider: string) {
  // Simple emoji placeholders to avoid external icon deps; can be replaced with brand SVGs later
  switch (provider) {
    case "INSTAGRAM": return "📸";
    case "FACEBOOK": return "f";
    case "YOUTUBE": return "▶";
    case "TIKTOK": return "♪";
    case "TWITTER": return "𝕏";
    case "WHATSAPP": return "🟢";
    case "LINKEDIN": return "in";
    default: return null;
  }
}

