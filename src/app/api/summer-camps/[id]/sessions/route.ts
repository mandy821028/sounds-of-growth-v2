import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, isAuthError } from "@/lib/auth";
import { z } from "zod";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT" };

async function guardCamp(campId: string, sUser: SessionUser) {
  const camp = await prisma.summerCamp.findUnique({ where: { id: campId } });
  if (!camp) return null;
  if (sUser.role === "SUPER_ADMIN") return camp;
  if (sUser.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
    if (!teacher || teacher.id !== camp.teacherId) return null;
    return camp;
  }
  return null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (isAuthError(auth)) return auth;
  const { id } = await params;
  const sUser = auth.user as SessionUser;

  const camp = await prisma.summerCamp.findUnique({ where: { id } });
  if (!camp) return new NextResponse("Not found", { status: 404 });

  // Students can read sessions of enrolled camps
  if (sUser.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: sUser.id } });
    if (!student) return new NextResponse("Forbidden", { status: 403 });
    const enrolled = await prisma.campEnrollment.findUnique({ where: { campId_studentId: { campId: id, studentId: student.id } } });
    if (!enrolled || enrolled.status !== "ACTIVE") return new NextResponse("Forbidden", { status: 403 });
  } else {
    const allowed = await guardCamp(id, sUser);
    if (!allowed) return new NextResponse("Forbidden", { status: 403 });
  }

  const sessions = await prisma.campSession.findMany({
    where: { campId: id },
    include: { resources: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(sessions);
}

const sessionSchema = z.object({
  title: z.string().optional(),
  startsAtUtc: z.string().datetime(),
  durationMin: z.number().int().min(15).default(60),
  timezone: z.string().default("America/Chicago"),
  order: z.number().int().default(0),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (isAuthError(auth)) return auth;
  const { id } = await params;

  const camp = await guardCamp(id, auth.user as SessionUser);
  if (!camp) return new NextResponse("Forbidden", { status: 403 });

  const body = await req.json();
  const parsed = sessionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.format(), { status: 400 });

  const data = parsed.data;
  const session = await prisma.campSession.create({
    data: {
      campId: id,
      title: data.title,
      startsAtUtc: new Date(data.startsAtUtc),
      durationMin: data.durationMin,
      timezone: data.timezone,
      order: data.order,
    },
  });
  return NextResponse.json(session, { status: 201 });
}
