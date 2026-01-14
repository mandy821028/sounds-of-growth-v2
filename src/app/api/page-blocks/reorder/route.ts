import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session || sUser?.role !== "SUPER_ADMIN") return new NextResponse("Forbidden", { status: 403 });
  const body = await req.json();
  const updates: Array<{ id: string; position: number }> = Array.isArray(body?.updates) ? body.updates : [];
  await prisma.$transaction(
    updates.map((u) => prisma.pageBlock.update({ where: { id: u.id }, data: { position: u.position } }))
  );
  return NextResponse.json({ ok: true });
}

