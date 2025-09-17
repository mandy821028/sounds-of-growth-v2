import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { z } from "zod";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

// Teacher or Super Admin approves/rejects
export async function PATCH(req: Request, { params }: Promise<{ params: { requestId: string } }>) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json();
  const parsed = z.object({ action: z.enum(["APPROVE", "REJECT"]) }).safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.format(), { status: 400 });

  const { requestId } = await params;
  const reqEntity = await prisma.lessonCancellationRequest.findUnique({ where: { id: requestId }, include: { lesson: true } });
  if (!reqEntity) return new NextResponse("Not found", { status: 404 });

  if (sUser.role === "TEACHER") {
    const t = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
    if (!t || t.id !== reqEntity.lesson.teacherId) return new NextResponse("Forbidden", { status: 403 });
  } else if (sUser.role !== "SUPER_ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const newStatus = parsed.data.action === "APPROVE" ? "APPROVED" : "REJECTED";
  const updated = await prisma.lessonCancellationRequest.update({ where: { id: requestId }, data: { status: newStatus as any } });
  // If approved: record a LessonException for the date to visually mark in calendar (not hiding the event)
  if (newStatus === 'APPROVED') {
    await prisma.lessonException.upsert({
      where: { lessonId_dateUtc: { lessonId: reqEntity.lessonId, dateUtc: reqEntity.requestedDateUtc } as any },
      update: { type: 'CANCELLED' as any, reason: reqEntity.reason ?? undefined },
      create: { lessonId: reqEntity.lessonId, dateUtc: reqEntity.requestedDateUtc, type: 'CANCELLED' as any, reason: reqEntity.reason ?? undefined },
    } as any);
  }
  return NextResponse.json(updated);
}


