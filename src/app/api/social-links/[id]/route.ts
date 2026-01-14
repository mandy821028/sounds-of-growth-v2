import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { provider, label, url, iconUrl, order, enabled } = body || {};
  const updated = await prisma.socialLink.update({
    where: { id: params.id },
    data: { provider, label, url, iconUrl, order, enabled },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.socialLink.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

