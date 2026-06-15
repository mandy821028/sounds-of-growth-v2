import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, isAuthError } from "@/lib/auth";
import { z } from "zod";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT" };

async function guardTeacher(campId: string, userId: string) {
  const camp = await prisma.summerCamp.findUnique({ where: { id: campId } });
  if (!camp) return null;
  const teacher = await prisma.teacher.findUnique({ where: { userId } });
  if (!teacher || teacher.id !== camp.teacherId) return null;
  return { camp, teacher };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (isAuthError(auth)) return auth;
  const { id } = await params;
  const sUser = auth.user as SessionUser;

  if (sUser.role !== "SUPER_ADMIN" && sUser.role !== "TEACHER") {
    return new NextResponse("Forbidden", { status: 403 });
  }
  if (sUser.role === "TEACHER") {
    const guard = await guardTeacher(id, sUser.id);
    if (!guard) return new NextResponse("Forbidden", { status: 403 });
  }

  const enrollments = await prisma.campEnrollment.findMany({
    where: { campId: id },
    include: { student: { include: { user: true } } },
    orderBy: { enrolledAt: "asc" },
  });
  return NextResponse.json(enrollments);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (isAuthError(auth)) return auth;
  const { id } = await params;
  const sUser = auth.user as SessionUser;

  if (sUser.role !== "SUPER_ADMIN" && sUser.role !== "TEACHER") {
    return new NextResponse("Forbidden", { status: 403 });
  }
  if (sUser.role === "TEACHER") {
    const guard = await guardTeacher(id, sUser.id);
    if (!guard) return new NextResponse("Forbidden", { status: 403 });
  }

  const body = await req.json();
  const parsed = z.object({ studentId: z.string().min(1) }).safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.format(), { status: 400 });

  // Check camp capacity
  const camp = await prisma.summerCamp.findUnique({
    where: { id },
    include: { _count: { select: { enrollments: { where: { status: "ACTIVE" } } } } },
  });
  if (!camp) return new NextResponse("Not found", { status: 404 });
  if (camp._count.enrollments >= camp.capacity) {
    return NextResponse.json({ error: "Camp is at full capacity" }, { status: 400 });
  }

  // Upsert: re-enroll if previously withdrawn
  const enrollment = await prisma.campEnrollment.upsert({
    where: { campId_studentId: { campId: id, studentId: parsed.data.studentId } },
    update: { status: "ACTIVE" },
    create: { campId: id, studentId: parsed.data.studentId },
    include: { student: { include: { user: true } } },
  });
  return NextResponse.json(enrollment, { status: 201 });
}
