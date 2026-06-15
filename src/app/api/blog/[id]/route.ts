import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, isAuthError } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Only published posts visible to public; admins see all
  if (!post.published) {
    const auth = await requireRole("SUPER_ADMIN");
    if (isAuthError(auth)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole("SUPER_ADMIN");
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await req.json();
  const { title, slug, excerpt, tag, imageUrl, published, locale } = body || {};
  if (slug && locale) {
    const exists = await prisma.blogPost.findFirst({ where: { locale, slug, NOT: { id } } });
    if (exists) return NextResponse.json({ error: "Slug already exists for locale" }, { status: 400 });
  }
  const updated = await prisma.blogPost.update({
    where: { id },
    data: { title, slug, excerpt, tag, imageUrl, published, locale },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole("SUPER_ADMIN");
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

