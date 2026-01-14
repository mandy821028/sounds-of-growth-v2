import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { PageBlockType } from "@prisma/client";
import HomeClient from "./HomeClient";
import { prisma as db } from "@/lib/prisma";

export default async function MarketingHome() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";

  const blocks = await prisma.pageBlock.findMany({
    where: { path: "/", locale, published: true },
    orderBy: { position: "asc" },
  });

  // Enrich BLOG_CARDS blocks automatically from BlogPost table when requested
  const enriched = await Promise.all(
    blocks.map(async (b) => {
      if (b.type === PageBlockType.BLOG_CARDS) {
        const data: any = b.data || {};
        const auto = data.source === "auto" || !Array.isArray(data.items);
        if (auto) {
          const limit = typeof data.limit === "number" ? data.limit : 6;
          const posts = await db.blogPost.findMany({
            where: { locale, published: true },
            orderBy: { createdAt: "desc" },
            take: limit,
          });
          const items = posts.map((p) => ({
            id: p.id,
            title: p.title,
            excerpt: p.excerpt ?? "",
            href: `/blog/${p.slug}`,
            tag: p.tag ?? undefined,
            image: p.imageUrl ?? undefined,
          }));
          return { ...b, data: { ...data, items } };
        }
      }
      return b;
    })
  );

  const fallbackBlocks = [
    { type: "HERO", data: { title: "Sounds of Growth", subtitle: locale === "es" ? "Plataforma para docentes de música y sus alumnos." : "Platform for music teachers and their students." } },
    { type: "CHALLENGE", data: { title: locale === "es" ? "Reto de la semana" : "Challenge of the Week", description: locale === "es" ? "Practica esta célula rítmica y mejora tu tiempo interno." : "Practice this rhythm cell to improve your inner time." } },
  ] as Array<{ type: PageBlockType; data: any }>;

  const toRender = (enriched.length > 0 ? enriched : fallbackBlocks) as Array<{ type: PageBlockType; data: any; audiences?: string[] }>;
  return <HomeClient blocks={toRender as any} />;
}


