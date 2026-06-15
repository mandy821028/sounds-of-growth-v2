import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, isAuthError } from "@/lib/auth";
import { z } from "zod";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT" };

async function guardSession(campId: string, sessionId: string, sUser: SessionUser) {
  const session = await prisma.campSession.findUnique({ where: { id: sessionId }, include: { camp: true } });
  if (!session || session.campId !== campId) return null;
  if (sUser.role === "SUPER_ADMIN") return session;
  if (sUser.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
    if (!teacher || teacher.id !== session.camp.teacherId) return null;
    return session;
  }
  return null;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const auth = await requireSession();
  if (isAuthError(auth)) return auth;
  const { id, sessionId } = await params;

  const session = await guardSession(id, sessionId, auth.user as SessionUser);
  if (!session) return new NextResponse("Forbidden", { status: 403 });

  const body = await req.json();
  const parsed = z.object({
    title: z.string().optional().nullable(),
    startsAtUtc: z.string().datetime().optional(),
    durationMin: z.number().int().min(15).optional(),
    timezone: z.string().optional(),
    order: z.number().int().optional(),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.format(), { status: 400 });

  const d = parsed.data as Record<string, unknown>;
  if (d.startsAtUtc) d.startsAtUtc = new Date(d.startsAtUtc as string) as unknown as string;

  const updated = await prisma.campSession.update({ where: { id: sessionId }, data: d });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const auth = await requireSession();
  if (isAuthError(auth)) return auth;
  const { id, sessionId } = await params;

  const session = await guardSession(id, sessionId, auth.user as SessionUser);
  if (!session) return new NextResponse("Forbidden", { status: 403 });

  await prisma.campSession.delete({ where: { id: sessionId } });
  return new NextResponse(null, { status: 204 });
}
