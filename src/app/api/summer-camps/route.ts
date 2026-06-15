import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, isAuthError } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { z } from "zod";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT" };

const campInclude = {
  teacher: { include: { user: true } },
  _count: { select: { enrollments: true, sessions: true } },
};

export async function GET() {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  if (sUser?.role === "SUPER_ADMIN") {
    const camps = await prisma.summerCamp.findMany({
      include: campInclude,
      orderBy: { startDate: "asc" },
    });
    return NextResponse.json(camps);
  }

  if (sUser?.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
    if (!teacher) return new NextResponse("Forbidden", { status: 403 });
    const camps = await prisma.summerCamp.findMany({
      where: { teacherId: teacher.id },
      include: campInclude,
      orderBy: { startDate: "asc" },
    });
    return NextResponse.json(camps);
  }

  if (sUser?.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: sUser.id } });
    if (!student) return new NextResponse("Forbidden", { status: 403 });
    const enrollments = await prisma.campEnrollment.findMany({
      where: { studentId: student.id, status: "ACTIVE" },
      include: { camp: { include: campInclude } },
      orderBy: { camp: { startDate: "asc" } },
    });
    return NextResponse.json(enrollments.map((e) => e.camp));
  }

  return new NextResponse("Forbidden", { status: 403 });
}

const createCampSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  ageMin: z.number().int().min(0).optional(),
  ageMax: z.number().int().min(0).optional(),
  focus: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  capacity: z.number().int().min(1).default(10),
  priceUsd: z.number().min(0).default(0),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  published: z.boolean().default(false),
  locale: z.enum(["en", "es"]).default("en"),
});

export async function POST(req: Request) {
  const auth = await requireRole("TEACHER");
  if (isAuthError(auth)) return auth;

  const teacher = await prisma.teacher.findUnique({ where: { userId: auth.user.id } });
  if (!teacher) return new NextResponse("Forbidden", { status: 403 });

  const body = await req.json();
  const parsed = createCampSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.format(), { status: 400 });

  const data = parsed.data;
  const camp = await prisma.summerCamp.create({
    data: {
      teacherId: teacher.id,
      name: data.name,
      description: data.description,
      ageMin: data.ageMin,
      ageMax: data.ageMax,
      focus: data.focus,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      capacity: data.capacity,
      priceUsd: data.priceUsd,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      published: data.published,
      locale: data.locale,
    },
  });
  return NextResponse.json(camp, { status: 201 });
}
