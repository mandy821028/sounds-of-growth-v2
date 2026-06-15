import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, isAuthError } from "@/lib/auth";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT" };

async function guardResource(campId: string, sessionId: string, resourceId: string, sUser: SessionUser) {
  const resource = await prisma.campSessionResource.findUnique({
    where: { id: resourceId },
    include: { session: { include: { camp: true } } },
  });
  if (!resource || resource.sessionId !== sessionId || resource.session.campId !== campId) return null;
  if (sUser.role === "SUPER_ADMIN") return resource;
  if (sUser.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
    if (!teacher || teacher.id !== resource.session.camp.teacherId) return null;
    return resource;
  }
  return null;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; sessionId: string; resourceId: string }> }) {
  const auth = await requireSession();
  if (isAuthError(auth)) return auth;
  const { id, sessionId, resourceId } = await params;

  const resource = await guardResource(id, sessionId, resourceId, auth.user as SessionUser);
  if (!resource) return new NextResponse("Forbidden", { status: 403 });

  const body = await req.json();
  const parsed = z.object({
    title: z.string().min(1).optional(),
    contentHtml: z.string().optional(),
    links: z.array(z.object({ label: z.string(), url: z.string().url() })).optional(),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.format(), { status: 400 });

  const data: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.contentHtml !== undefined) data.contentHtml = sanitizeHtml(parsed.data.contentHtml);
  if (parsed.data.links !== undefined) data.links = parsed.data.links;

  const updated = await prisma.campSessionResource.update({ where: { id: resourceId }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; sessionId: string; resourceId: string }> }) {
  const auth = await requireSession();
  if (isAuthError(auth)) return auth;
  const { id, sessionId, resourceId } = await params;

  const resource = await guardResource(id, sessionId, resourceId, auth.user as SessionUser);
  if (!resource) return new NextResponse("Forbidden", { status: 403 });

  await prisma.campSessionResource.delete({ where: { id: resourceId } });
  return new NextResponse(null, { status: 204 });
}
