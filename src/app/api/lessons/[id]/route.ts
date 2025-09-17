import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { z } from "zod";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

export async function GET(req: Request, { params }: Promise<{ params: { id: string } }>) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await params;
  const url = new URL(req.url);
  const occ = url.searchParams.get('occ');
  const lesson = await prisma.lesson.findUnique({ where: { id }, include: { student: { include: { user: true } }, teacher: { include: { user: true } }, classType: true, cancelRequests: true } });
  if (!lesson) return new NextResponse("Not found", { status: 404 });
  if (sUser.role === "SUPER_ADMIN") return NextResponse.json(lesson);
  if (sUser.role === "TEACHER") {
    const t = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
    if (!t || t.id !== lesson.teacherId) return new NextResponse("Forbidden", { status: 403 });
    // add cancel status for specific occurrence if requested
    if (occ) {
      const iso = new Date(occ).toISOString();
      const reqForDate = await prisma.lessonCancellationRequest.findFirst({ where: { lessonId: id, requestedDateUtc: new Date(iso) } });
      const ex = await prisma.lessonException.findFirst({ where: { lessonId: id, dateUtc: new Date(iso) } });
      const cancelStatus = reqForDate?.status ?? (ex ? 'APPROVED' : null);
      return NextResponse.json({ ...lesson, cancelStatus });
    }
    return NextResponse.json(lesson);
  }
  if (sUser.role === "STUDENT") {
    // Students can only access published lessons
    if (!lesson.published) return new NextResponse("Forbidden", { status: 403 });
    const st = await prisma.student.findUnique({ where: { userId: sUser.id } });
    if (!st || st.id !== lesson.studentId) return new NextResponse("Forbidden", { status: 403 });
    if (occ) {
      const iso = new Date(occ).toISOString();
      const reqForDate = await prisma.lessonCancellationRequest.findFirst({ where: { lessonId: id, requestedDateUtc: new Date(iso), studentId: st.id } });
      const ex = await prisma.lessonException.findFirst({ where: { lessonId: id, dateUtc: new Date(iso) } });
      const cancelStatus = reqForDate?.status ?? (ex ? 'APPROVED' : null);
      return NextResponse.json({ ...lesson, cancelStatus });
    }
    return NextResponse.json(lesson);
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function PATCH(req: Request, { params }: Promise<{ params: { id: string } }>) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const parsed = z.object({
    published: z.boolean().optional(),
    status: z.enum(["CREATED", "CANCELLED", "COMPLETED"]).optional(),
    // editable fields
    classTypeId: z.string().optional(),
    startsAtUtc: z.string().datetime().optional(),
    durationMin: z.number().optional(),
    timezone: z.string().optional(),
    priceUsd: z.number().optional(),
    address: z.string().optional().nullable(),
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable(),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.format(), { status: 400 });

  const lesson = await prisma.lesson.findUnique({ where: { id }, include: { teacher: true, student: true } });
  if (!lesson) return new NextResponse("Not found", { status: 404 });
  if (sUser.role === "TEACHER") {
    const t = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
    if (!t || t.id !== lesson.teacherId) return new NextResponse("Forbidden", { status: 403 });
  } else if (sUser.role !== "SUPER_ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Build update data
  const d: any = { ...parsed.data };
  if (d.startsAtUtc) d.startsAtUtc = new Date(d.startsAtUtc);
  if (d.address === null) d.address = undefined;
  if (d.lat === null) d.lat = undefined;
  if (d.lng === null) d.lng = undefined;

  const updated = await prisma.lesson.update({ where: { id }, data: d });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Promise<{ params: { id: string } }>) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { id }, include: { teacher: true } });
  if (!lesson) return new NextResponse("Not found", { status: 404 });
  if (sUser?.role === "TEACHER") {
    const t = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
    if (!t || t.id !== lesson.teacherId) return new NextResponse("Forbidden", { status: 403 });
  } else if (sUser?.role !== "SUPER_ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }
  // delete dependents first
  await prisma.lessonCancellationRequest.deleteMany({ where: { lessonId: id } });
  await prisma.lessonException.deleteMany({ where: { lessonId: id } });
  await prisma.lesson.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}


