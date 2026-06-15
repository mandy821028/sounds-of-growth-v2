import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, isAuthError } from "@/lib/auth";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT" };

async function getCampSession(campId: string, sessionId: string) {
  return prisma.campSession.findUnique({ where: { id: sessionId }, include: { camp: true } });
}

async function canTeachCamp(campTeacherId: string, userId: string) {
  const teacher = await prisma.teacher.findUnique({ where: { userId } });
  return teacher && teacher.id === campTeacherId;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const auth = await requireSession();
  if (isAuthError(auth)) return auth;
  const { id, sessionId } = await params;
  const sUser = auth.user as SessionUser;

  const campSession = await getCampSession(id, sessionId);
  if (!campSession) return new NextResponse("Not found", { status: 404 });

  // Students can read if enrolled
  if (sUser.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: sUser.id } });
    if (!student) return new NextResponse("Forbidden", { status: 403 });
    const enrolled = await prisma.campEnrollment.findUnique({
      where: { campId_studentId: { campId: id, studentId: student.id } },
    });
    if (!enrolled || enrolled.status !== "ACTIVE") return new NextResponse("Forbidden", { status: 403 });
  } else if (sUser.role === "TEACHER") {
    const ok = await canTeachCamp(campSession.camp.teacherId, sUser.id);
    if (!ok) return new NextResponse("Forbidden", { status: 403 });
  } else if (sUser.role !== "SUPER_ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const resources = await prisma.campSessionResource.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(resources);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const auth = await requireSession();
  if (isAuthError(auth)) return auth;
  const { id, sessionId } = await params;
  const sUser = auth.user as SessionUser;

  const campSession = await getCampSession(id, sessionId);
  if (!campSession) return new NextResponse("Not found", { status: 404 });

  if (sUser.role === "TEACHER") {
    const ok = await canTeachCamp(campSession.camp.teacherId, sUser.id);
    if (!ok) return new NextResponse("Forbidden", { status: 403 });
  } else if (sUser.role !== "SUPER_ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const body = await req.json();
  const parsed = z.object({
    title: z.string().min(1),
    contentHtml: z.string(),
    links: z.array(z.object({ label: z.string(), url: z.string().url() })).optional(),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.format(), { status: 400 });

  const resource = await prisma.campSessionResource.create({
    data: {
      sessionId,
      title: parsed.data.title,
      contentHtml: sanitizeHtml(parsed.data.contentHtml),
      links: parsed.data.links ?? [],
    },
  });
  return NextResponse.json(resource, { status: 201 });
}
