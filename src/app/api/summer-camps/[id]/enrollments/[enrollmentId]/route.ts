import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, isAuthError } from "@/lib/auth";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT" };

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; enrollmentId: string }> }) {
  const auth = await requireSession();
  if (isAuthError(auth)) return auth;
  const { id, enrollmentId } = await params;
  const sUser = auth.user as SessionUser;

  if (sUser.role !== "SUPER_ADMIN" && sUser.role !== "TEACHER") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const enrollment = await prisma.campEnrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment || enrollment.campId !== id) return new NextResponse("Not found", { status: 404 });

  if (sUser.role === "TEACHER") {
    const camp = await prisma.summerCamp.findUnique({ where: { id } });
    const teacher = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
    if (!camp || !teacher || teacher.id !== camp.teacherId) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  await prisma.campEnrollment.update({ where: { id: enrollmentId }, data: { status: "WITHDRAWN" } });
  return new NextResponse(null, { status: 204 });
}
