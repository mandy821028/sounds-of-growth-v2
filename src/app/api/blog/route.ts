import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = (searchParams.get("locale") === "es" ? "es" : "en") as "en" | "es";
  const published = searchParams.get("published");
  const where: any = { locale };
  if (published === "true") where.published = true;
  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    locale = "en",
    title,
    slug,
    excerpt,
    tag,
    imageUrl,
    published = false,
  } = body || {};
  if (!title || !slug) {
    return NextResponse.json({ error: "title and slug are required" }, { status: 400 });
  }
  // ensure unique slug per locale
  const exists = await prisma.blogPost.findFirst({ where: { locale, slug } });
  if (exists) return NextResponse.json({ error: "Slug already exists for locale" }, { status: 400 });
  const created = await prisma.blogPost.create({
    data: { locale, title, slug, excerpt, tag, imageUrl, published },
  });
  return NextResponse.json(created, { status: 201 });
}

