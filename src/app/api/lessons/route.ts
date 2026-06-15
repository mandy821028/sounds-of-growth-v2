import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { z } from "zod";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

const createLessonSchema = z.object({
  studentId: z.string().min(1),
  classTypeId: z.string().min(1),
  startsAtUtc: z.string().datetime(),
  durationMin: z.enum(["30", "45", "60"]).transform((v) => Number(v)),
  timezone: z.string().min(1),
  recurrence: z.enum(["WEEKLY", "BIWEEKLY"]).optional(),
  recurrenceEndUtc: z.string().datetime().optional(),
  priceUsd: z.number().min(0),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  published: z.boolean().default(false),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status"); // CREATED | CANCELLED | COMPLETED
  const pub = url.searchParams.get("published"); // YES | NO
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const q = (url.searchParams.get("q") || "").trim();

  const whereBase: any = {};
  if (status && ["CREATED", "CANCELLED", "COMPLETED"].includes(status)) whereBase.status = status;
  if (pub === "YES") whereBase.published = true;
  if (pub === "NO") whereBase.published = false;
  if (from) whereBase.startsAtUtc = { ...(whereBase.startsAtUtc || {}), gte: new Date(`${from}T00:00:00`) };
  if (to) whereBase.startsAtUtc = { ...(whereBase.startsAtUtc || {}), lte: new Date(`${to}T23:59:59`) };

  const orderBy = { startsAtUtc: "asc" as const };

  // MySQL uses case-insensitive collation (utf8_general_ci) by default — no mode needed
  if (sUser?.role === "SUPER_ADMIN") {
    const lessons = await prisma.lesson.findMany({
      where: {
        ...whereBase,
        ...(q
          ? {
              OR: [
                { classType: { name: { contains: q } } },
                { student: { user: { OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }] } } },
                { teacher: { user: { OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }] } } },
              ],
            }
          : {}),
      },
      include: { student: { include: { user: true } }, teacher: { include: { user: true } }, classType: true },
      orderBy,
    });
    return NextResponse.json(lessons);
  }
  if (sUser?.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
    if (!teacher) return new NextResponse("Forbidden", { status: 403 });
    const lessons = await prisma.lesson.findMany({
      where: {
        teacherId: teacher.id,
        ...whereBase,
        ...(q
          ? {
              OR: [
                { classType: { name: { contains: q } } },
                { student: { user: { OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }] } } },
              ],
            }
          : {}),
      },
      include: { student: { include: { user: true } }, classType: true },
      orderBy,
    });
    return NextResponse.json(lessons);
  }
  if (sUser?.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: sUser.id } });
    if (!student) return new NextResponse("Forbidden", { status: 403 });
    const lessons = await prisma.lesson.findMany({
      where: {
        studentId: student.id,
        published: true, // students only see published lessons
        ...whereBase,
        ...(q
          ? {
              OR: [
                { classType: { name: { contains: q } } },
                { teacher: { user: { OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }] } } },
              ],
            }
          : {}),
      },
      include: { teacher: { include: { user: true } }, classType: true },
      orderBy,
    });
    return NextResponse.json(lessons);
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session || sUser?.role !== "TEACHER") return new NextResponse("Forbidden", { status: 403 });
  const teacher = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
  if (!teacher) return new NextResponse("Forbidden", { status: 403 });

  const body = await req.json();
  const parsed = createLessonSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.format(), { status: 400 });
  const data = parsed.data;

  // IDOR guard: ensure the student actually belongs to this teacher
  const student = await prisma.student.findUnique({ where: { id: data.studentId }, select: { teacherId: true } });
  if (!student || student.teacherId !== teacher.id) return new NextResponse("Forbidden", { status: 403 });

  const lesson = await prisma.lesson.create({
    data: {
      teacherId: teacher.id,
      studentId: data.studentId,
      classTypeId: data.classTypeId,
      startsAtUtc: new Date(data.startsAtUtc),
      durationMin: data.durationMin,
      timezone: data.timezone,
      recurrence: data.recurrence,
      recurrenceEndUtc: data.recurrenceEndUtc ? new Date(data.recurrenceEndUtc) : undefined,
      priceUsd: data.priceUsd,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      published: data.published,
    },
  });
  return NextResponse.json(lesson, { status: 201 });
}


