import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { PageBlockType } from "@prisma/client";
import HomeClient from "./HomeClient";
import { prisma as db } from "@/lib/prisma";
import type { PageBlock, SliderItem } from "@prisma/client";

type HomeBlock = {
  id?: string;
  type: PageBlockType;
  data: unknown;
  audiences?: string[] | null;
};

function normalizeAudiences(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const strings = v.filter((x): x is string => typeof x === "string");
  return strings.length > 0 ? strings : null;
}

export default async function MarketingHome() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";

  const sliderItems = await prisma.sliderItem
    .findMany({
      where: { locale, enabled: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    })
    .catch(() => []);

  const sliderConfig = await prisma.sliderConfig
    .findUnique({ where: { locale } })
    .catch(() => null);

  const blocks: PageBlock[] = await prisma.pageBlock.findMany({
    where: { path: "/", locale, published: true },
    orderBy: { position: "asc" },
  });

  // Enrich BLOG_CARDS blocks automatically from BlogPost table when requested
  const enriched = await Promise.all(
    blocks.map(async (b) => {
      if (b.type === PageBlockType.BLOG_CARDS) {
        const data = (b.data ?? {}) as Record<string, unknown>;
        const source = data.source;
        const items = data.items;
        const auto = source === "auto" || !Array.isArray(items);
        if (auto) {
          const limit = typeof data.limit === "number" ? data.limit : 6;
          const posts = await db.blogPost.findMany({
            where: { locale, published: true },
            orderBy: { createdAt: "desc" },
            take: limit,
          });
          const nextItems = posts.map((p) => ({
            id: p.id,
            title: p.title,
            excerpt: p.excerpt ?? "",
            href: `/blog/${p.slug}`,
            tag: p.tag ?? undefined,
            image: p.imageUrl ?? undefined,
          }));
          return { ...b, data: { ...data, items: nextItems } };
        }
      }
      return b;
    })
  );

  const fallbackBlocks: HomeBlock[] = [
    {
      type: PageBlockType.HERO,
      data: {
        title: "Sounds of Growth",
        subtitle:
          locale === "es"
            ? "Plataforma para docentes de música y sus alumnos."
            : "Platform for music teachers and their students.",
      },
    },
    {
      type: PageBlockType.CHALLENGE,
      data: {
        title: locale === "es" ? "Reto de la semana" : "Challenge of the Week",
        description:
          locale === "es"
            ? "Practica esta célula rítmica y mejora tu tiempo interno."
            : "Practice this rhythm cell to improve your inner time.",
      },
    },
  ];

  const sourceBlocks = (enriched.length > 0 ? enriched : fallbackBlocks) as unknown as Array<{
    id?: string;
    type: PageBlockType;
    data: unknown;
    audiences?: unknown;
  }>;

  const toRender: HomeBlock[] = sourceBlocks.map((b) => ({
    id: typeof b.id === "string" ? b.id : undefined,
    type: b.type,
    data: b.data,
    audiences: normalizeAudiences(b.audiences),
  }));

  const sliderForHome = (sliderItems as SliderItem[]).map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    imageUrl: s.imageUrl,
    buttonLabel: s.buttonLabel,
    buttonHref: s.buttonHref,
    buttonTarget: s.buttonTarget,
  }));

  const sliderConfigForHome = {
    intervalMs: sliderConfig?.intervalMs ?? 6500,
    transition: sliderConfig?.transition === "slide" ? "slide" : "fade",
    textAnimation: sliderConfig?.textAnimation === "none" ? "none" : sliderConfig?.textAnimation === "fade" ? "fade" : "fade-up",
  } as const;

  return <HomeClient blocks={toRender} sliderItems={sliderForHome} sliderConfig={sliderConfigForHome} />;
}


