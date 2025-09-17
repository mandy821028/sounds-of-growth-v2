import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { z } from "zod";
import { sanitizePlainText, sanitizeRichHtml } from "@/lib/sanitize";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

const schema = z.object({ title: z.string().min(1).optional(), contentHtml: z.string().min(1).optional(), links: z.array(z.string().url()).optional() });

export async function PATCH(req: Request, { params }: Promise<{ params: { resourceId: string } }>) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const { resourceId } = await params;
  const r = await prisma.lessonResource.findUnique({ where: { id: resourceId }, include: { lesson: true } });
  if (!r) return new NextResponse("Not found", { status: 404 });
  if (sUser?.role === "TEACHER") {
    const t = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
    if (!t || t.id !== r.lesson.teacherId) return new NextResponse("Forbidden", { status: 403 });
  } else if (sUser?.role !== "SUPER_ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json(parsed.error.format(), { status: 400 });
  const data: any = { ...parsed.data };
  if (data.title !== undefined) data.title = sanitizePlainText(data.title);
  if (data.contentHtml !== undefined) data.contentHtml = sanitizeRichHtml(data.contentHtml);
  const updated = await prisma.lessonResource.update({ where: { id: r.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Promise<{ params: { resourceId: string } }>) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const { resourceId } = await params;
  const r = await prisma.lessonResource.findUnique({ where: { id: resourceId }, include: { lesson: true } });
  if (!r) return new NextResponse("Not found", { status: 404 });
  if (sUser?.role === "TEACHER") {
    const t = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
    if (!t || t.id !== r.lesson.teacherId) return new NextResponse("Forbidden", { status: 403 });
  } else if (sUser?.role !== "SUPER_ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }
  await prisma.lessonResource.delete({ where: { id: r.id } });
  return new NextResponse(null, { status: 204 });
}


