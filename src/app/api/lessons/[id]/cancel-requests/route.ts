import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { z } from "zod";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

// Student requests cancellation for a specific occurrence
export async function POST(req: Request, { params }: Promise<{ params: { id: string } }>) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session || sUser?.role !== "STUDENT") return new NextResponse("Forbidden", { status: 403 });
  const student = await prisma.student.findUnique({ where: { userId: sUser.id } });
  if (!student) return new NextResponse("Forbidden", { status: 403 });

  const body = await req.json();
  const parsed = z.object({ requestedDateUtc: z.string().datetime(), reason: z.string().optional() }).safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.format(), { status: 400 });

  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { id } });
  if (!lesson || lesson.studentId !== student.id) return new NextResponse("Forbidden", { status: 403 });

  const created = await prisma.lessonCancellationRequest.create({
    data: {
      lessonId: lesson.id,
      studentId: student.id,
      requestedDateUtc: new Date(parsed.data.requestedDateUtc),
      reason: parsed.data.reason,
    },
  });
  return NextResponse.json(created, { status: 201 });
}


