import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { z } from "zod";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional().nullable(),
  locale: z.enum(["en","es"]).optional(),
  address: z.string().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  dateOfBirth: z.string().optional(),
});

export async function GET(_req: Request, { params }: Promise<{ params: { id: string } }>) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session || sUser?.role !== "TEACHER") return new NextResponse("Forbidden", { status: 403 });
  const { id } = await params;
  const student = await prisma.student.findUnique({ where: { id }, include: { user: true } });
  if (!student) return new NextResponse("Not found", { status: 404 });
  const me = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
  if (!me || me.id !== student.teacherId) return new NextResponse("Forbidden", { status: 403 });
  return NextResponse.json(student);
}

export async function PATCH(req: Request, { params }: Promise<{ params: { id: string } }>) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session || sUser?.role !== "TEACHER") return new NextResponse("Forbidden", { status: 403 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.format(), { status: 400 });
  const { id } = await params;
  const student = await prisma.student.findUnique({ where: { id }, include: { user: true } });
  if (!student) return new NextResponse("Not found", { status: 404 });
  const me = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
  if (!me || me.id !== student.teacherId) return new NextResponse("Forbidden", { status: 403 });
  const { firstName, lastName, phone, locale, address, lat, lng, dateOfBirth } = parsed.data;
  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.user.update({ where: { id: student.userId }, data: { firstName, lastName, phone: phone ?? undefined, locale: locale ?? student.user.locale } });
    const st = await tx.student.update({ where: { id: student.id }, data: { address: address ?? undefined, lat: lat ?? undefined, lng: lng ?? undefined, ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}) } });
    return { user: u, student: st };
  });
  return NextResponse.json(updated);
}


