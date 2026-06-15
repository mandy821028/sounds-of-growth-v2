import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, isAuthError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = (searchParams.get("locale") === "es" ? "es" : "en") as "en" | "es";
  const published = searchParams.get("published");
  const where: { locale: string; published?: boolean } = { locale };
  // Unauthenticated callers only see published posts
  if (published === "true" || !published) where.published = true;
  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const auth = await requireRole("SUPER_ADMIN");
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const { locale = "en", title, slug, excerpt, tag, imageUrl, published = false } = body || {};
  if (!title || !slug) {
    return NextResponse.json({ error: "title and slug are required" }, { status: 400 });
  }
  const exists = await prisma.blogPost.findFirst({ where: { locale, slug } });
  if (exists) return NextResponse.json({ error: "Slug already exists for locale" }, { status: 400 });
  const created = await prisma.blogPost.create({
    data: { locale, title, slug, excerpt, tag, imageUrl, published },
  });
  return NextResponse.json(created, { status: 201 });
}

