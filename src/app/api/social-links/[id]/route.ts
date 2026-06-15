import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, isAuthError } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole("SUPER_ADMIN");
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await req.json();
  const { provider, label, url, iconUrl, order, enabled } = body || {};
  const updated = await prisma.socialLink.update({
    where: { id },
    data: { provider, label, url, iconUrl, order, enabled },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole("SUPER_ADMIN");
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  await prisma.socialLink.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

