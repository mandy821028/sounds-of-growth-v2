import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { z } from "zod";
import { sanitizePlainText, sanitizeRichHtml } from "@/lib/sanitize";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

const createSchema = z.object({ title: z.string().min(1), contentHtml: z.string().min(1), links: z.array(z.string().url()).optional() });

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const p = await (ctx.params as any);
  const lesson = await prisma.lesson.findUnique({ where: { id: p.id }, include: { student: true, teacher: true } });
  if (!lesson) return new NextResponse("Not found", { status: 404 });
  if (sUser?.role === "SUPER_ADMIN") {
    const items = await prisma.lessonResource.findMany({ where: { lessonId: p.id }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(items);
  }
  if (sUser?.role === "TEACHER") {
    const t = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
    if (!t || t.id !== lesson.teacherId) return new NextResponse("Forbidden", { status: 403 });
    const items = await prisma.lessonResource.findMany({ where: { lessonId: p.id }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(items);
  }
  if (sUser?.role === "STUDENT") {
    // Students can only view resources for published lessons
    if (!lesson.published) return new NextResponse("Forbidden", { status: 403 });
    const st = await prisma.student.findUnique({ where: { userId: sUser.id } });
    if (!st || st.id !== lesson.studentId) return new NextResponse("Forbidden", { status: 403 });
    const items = await prisma.lessonResource.findMany({ where: { lessonId: p.id }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(items);
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const p = await (ctx.params as any);
  const lesson = await prisma.lesson.findUnique({ where: { id: p.id } });
  if (!lesson) return new NextResponse("Not found", { status: 404 });
  if (sUser?.role === "TEACHER") {
    const t = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
    if (!t || t.id !== lesson.teacherId) return new NextResponse("Forbidden", { status: 403 });
  } else if (sUser?.role !== "SUPER_ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const json = await req.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json(parsed.error.format(), { status: 400 });
  const created = await prisma.lessonResource.create({ data: { lessonId: p.id, title: sanitizePlainText(parsed.data.title), contentHtml: sanitizeRichHtml(parsed.data.contentHtml), links: parsed.data.links as any } });
  return NextResponse.json(created, { status: 201 });
}


