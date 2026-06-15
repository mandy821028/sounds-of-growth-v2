import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, isAuthError } from "@/lib/auth";
import { z } from "zod";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT" };

const campInclude = {
  teacher: { include: { user: true } },
  sessions: { orderBy: { order: "asc" as const }, include: { resources: true } },
  enrollments: { where: { status: "ACTIVE" as const }, include: { student: { include: { user: true } } } },
  _count: { select: { enrollments: true } },
};

async function getTeacherForUser(userId: string) {
  return prisma.teacher.findUnique({ where: { userId } });
}

async function getStudentForUser(userId: string) {
  return prisma.student.findUnique({ where: { userId } });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (isAuthError(auth)) return auth;
  const sUser = auth.user as SessionUser;
  const { id } = await params;

  const camp = await prisma.summerCamp.findUnique({ where: { id }, include: campInclude });
  if (!camp) return new NextResponse("Not found", { status: 404 });

  if (sUser.role === "SUPER_ADMIN") return NextResponse.json(camp);

  if (sUser.role === "TEACHER") {
    const teacher = await getTeacherForUser(sUser.id);
    if (!teacher || teacher.id !== camp.teacherId) return new NextResponse("Forbidden", { status: 403 });
    return NextResponse.json(camp);
  }

  if (sUser.role === "STUDENT") {
    if (!camp.published) return new NextResponse("Not found", { status: 404 });
    const student = await getStudentForUser(sUser.id);
    if (!student) return new NextResponse("Forbidden", { status: 403 });
    const enrolled = camp.enrollments.some((e) => e.studentId === student.id);
    if (!enrolled) return new NextResponse("Forbidden", { status: 403 });
    return NextResponse.json(camp);
  }

  return new NextResponse("Forbidden", { status: 403 });
}

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  ageMin: z.number().int().min(0).optional().nullable(),
  ageMax: z.number().int().min(0).optional().nullable(),
  focus: z.string().optional().nullable(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  capacity: z.number().int().min(1).optional(),
  priceUsd: z.number().min(0).optional(),
  address: z.string().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  published: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  locale: z.enum(["en", "es"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (isAuthError(auth)) return auth;
  const sUser = auth.user as SessionUser;
  const { id } = await params;

  const camp = await prisma.summerCamp.findUnique({ where: { id } });
  if (!camp) return new NextResponse("Not found", { status: 404 });

  if (sUser.role === "TEACHER") {
    const teacher = await getTeacherForUser(sUser.id);
    if (!teacher || teacher.id !== camp.teacherId) return new NextResponse("Forbidden", { status: 403 });
  } else if (sUser.role !== "SUPER_ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.format(), { status: 400 });

  const d = parsed.data as Record<string, unknown>;
  if (d.startDate) d.startDate = new Date(d.startDate as string) as unknown as string;
  if (d.endDate) d.endDate = new Date(d.endDate as string) as unknown as string;

  const updated = await prisma.summerCamp.update({ where: { id }, data: d });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (isAuthError(auth)) return auth;
  const sUser = auth.user as SessionUser;
  const { id } = await params;

  const camp = await prisma.summerCamp.findUnique({ where: { id } });
  if (!camp) return new NextResponse("Not found", { status: 404 });

  if (sUser.role === "TEACHER") {
    const teacher = await getTeacherForUser(sUser.id);
    if (!teacher || teacher.id !== camp.teacherId) return new NextResponse("Forbidden", { status: 403 });
  } else if (sUser.role !== "SUPER_ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  await prisma.summerCamp.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
