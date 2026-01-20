import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { normalizeLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value || "en";
  const locale = normalizeLocale(cookieLocale);

  const posts = await prisma.blogPost.findMany({
    where: { locale, published: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <p className="mt-2 text-muted-foreground">
            {locale === "es" ? "Artículos y recursos." : "Articles and resources."}
          </p>
        </div>
        <Link href="/" className="text-sm border border-default rounded px-3 py-2 hover:bg-primary/10">
          {locale === "es" ? "Inicio" : "Home"}
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="mt-10 text-sm text-muted-foreground">
          {locale === "es" ? "Aún no hay publicaciones." : "No posts yet."}
        </div>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="group rounded-2xl border border-default bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 overflow-hidden hover:bg-card/80 transition"
            >
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt=""
                  className="h-44 w-full object-cover border-b border-default"
                  loading="lazy"
                />
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {p.tag && (
                    <span className="rounded-full border border-default bg-secondary px-2 py-1">
                      {p.tag}
                    </span>
                  )}
                  <span className="opacity-70">/{p.locale}/blog/{p.slug}</span>
                </div>
                <h2 className="mt-3 text-lg font-semibold group-hover:text-foreground">
                  {p.title}
                </h2>
                {p.excerpt && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {p.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

