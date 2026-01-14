import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { title, slug, excerpt, tag, imageUrl, published, locale } = body || {};
  if (slug && locale) {
    const exists = await prisma.blogPost.findFirst({
      where: { locale, slug, NOT: { id: params.id } },
    });
    if (exists) return NextResponse.json({ error: "Slug already exists for locale" }, { status: 400 });
  }
  const updated = await prisma.blogPost.update({
    where: { id: params.id },
    data: { title, slug, excerpt, tag, imageUrl, published, locale },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.blogPost.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

