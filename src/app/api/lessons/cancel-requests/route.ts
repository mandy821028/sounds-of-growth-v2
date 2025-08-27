import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

export async function GET() {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  if (sUser?.role === "SUPER_ADMIN") {
    const all = await prisma.lessonCancellationRequest.findMany({ include: { lesson: { include: { student: { include: { user: true } }, teacher: { include: { user: true } } } } }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(all);
  }
  if (sUser?.role === "TEACHER") {
    const t = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
    if (!t) return new NextResponse("Forbidden", { status: 403 });
    const list = await prisma.lessonCancellationRequest.findMany({ where: { lesson: { teacherId: t.id } }, include: { lesson: { include: { student: { include: { user: true } } } } }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(list);
  }
  return new NextResponse("Forbidden", { status: 403 });
}


