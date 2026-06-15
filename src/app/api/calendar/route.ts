import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const url = new URL(req.url);
  const start = new Date(url.searchParams.get("start") || new Date(Date.now() - 7 * 24 * 3600e3).toISOString());
  const end = new Date(url.searchParams.get("end") || new Date(Date.now() + 30 * 24 * 3600e3).toISOString());

  // fetch lessons by role
  let lessons: any[] = [];
  let teacherId: string | null = null;
  let studentId: string | null = null;
  // date range predicate: include non-recurring inside range OR recurring that overlaps range
  const rangeOverlap: any = {
    OR: [
      { recurrence: null, startsAtUtc: { gte: start, lte: end } },
      {
        recurrence: { not: null },
        startsAtUtc: { lte: end },
        OR: [{ recurrenceEndUtc: null }, { recurrenceEndUtc: { gte: start } }],
      },
    ],
  };

  if (sUser?.role === "SUPER_ADMIN") {
    lessons = await prisma.lesson.findMany({ where: rangeOverlap, include: { student: { include: { user: true } }, teacher: { include: { user: true } }, classType: true } });
  } else if (sUser?.role === "TEACHER") {
    const t = await prisma.teacher.findUnique({ where: { userId: sUser.id } });
    if (!t) return new NextResponse("Forbidden", { status: 403 });
    teacherId = t.id;
    lessons = await prisma.lesson.findMany({ where: { teacherId: t.id, ...rangeOverlap }, include: { student: { include: { user: true } }, classType: true } });
  } else if (sUser?.role === "STUDENT") {
    const st = await prisma.student.findUnique({ where: { userId: sUser.id } });
    if (!st) return new NextResponse("Forbidden", { status: 403 });
    studentId = st.id;
    lessons = await prisma.lesson.findMany({ where: { studentId: st.id, published: true, ...rangeOverlap }, include: { teacher: { include: { user: true } }, classType: true } });
  } else {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Load cancellation requests in range, limited by role
  const whereReq: any = { requestedDateUtc: { gte: start, lte: end } };
  if (teacherId) whereReq.lesson = { teacherId };
  if (studentId) whereReq.studentId = studentId;
  const requests = await prisma.lessonCancellationRequest.findMany({ where: whereReq });
  const excepts = await prisma.lessonException.findMany({ where: { dateUtc: { gte: start, lte: end }, ...(teacherId ? { lesson: { teacherId } } : {}), ...(studentId ? { lesson: { studentId } } : {}) } as any });
  const key = (lessonId: string, iso: string) => `${lessonId}|${iso}`;
  const cancelMap = new Map<string, "PENDING" | "APPROVED" | "REJECTED">();
  for (const r of requests) {
    const k = key(r.lessonId, new Date(r.requestedDateUtc).toISOString());
    cancelMap.set(k, r.status as any);
  }
  const exceptMap = new Map<string, string>();
  for (const ex of excepts) {
    exceptMap.set(key(ex.lessonId, new Date(ex.dateUtc).toISOString()), ex.type);
  }

  // Expand recurrence: weekly (7d) or biweekly (14d)
  const events: any[] = [];
  for (const l of lessons) {
    const base = new Date(l.startsAtUtc);
    function push(d: Date) {
      const iso = d.toISOString();
      events.push({
        id: l.id,
        occurrence: iso,
        title: `${l.classType?.name ?? "Class"} · ${l.student?.user?.firstName ?? l.teacher?.user?.firstName ?? ""}`,
        startsAtUtc: iso,
        durationMin: l.durationMin,
        published: l.published,
        status: l.status,
        cancelStatus: cancelMap.get(key(l.id, iso)) ?? (exceptMap.get(key(l.id, iso)) === 'CANCELLED' ? 'APPROVED' : null),
        personName: l.student?.user ? `${l.student.user.firstName}` : `${l.teacher?.user?.firstName ?? ''}`,
        personImage: l.student?.user ? (l.student.user as any).image : (l.teacher?.user as any)?.image,
      });
    }
    if (!l.recurrence) {
      if (base >= start && base <= end) push(base);
    } else {
      let d = new Date(base);
      const until = l.recurrenceEndUtc ? new Date(l.recurrenceEndUtc) : end;
      const stepDays = l.recurrence === 'BIWEEKLY' ? 14 : 7;
      while (d <= end && d <= until) {
        if (d >= start) push(new Date(d));
        d = new Date(d.getTime() + stepDays * 24 * 3600e3);
      }
    }
  }
  // ── Summer Camp Sessions ────────────────────────────────────────────────────
  let campSessions: any[] = [];

  if (sUser?.role === "SUPER_ADMIN") {
    campSessions = await prisma.campSession.findMany({
      where: { startsAtUtc: { gte: start, lte: end } },
      include: { camp: { include: { teacher: { include: { user: true } } } } },
    });
  } else if (sUser?.role === "TEACHER" && teacherId) {
    campSessions = await prisma.campSession.findMany({
      where: { startsAtUtc: { gte: start, lte: end }, camp: { teacherId } },
      include: { camp: true },
    });
  } else if (sUser?.role === "STUDENT" && studentId) {
    const enrollments = await prisma.campEnrollment.findMany({
      where: { studentId, status: "ACTIVE" },
      select: { campId: true },
    });
    const campIds = enrollments.map((e) => e.campId);
    if (campIds.length > 0) {
      campSessions = await prisma.campSession.findMany({
        where: { startsAtUtc: { gte: start, lte: end }, campId: { in: campIds } },
        include: { camp: true },
      });
    }
  }

  for (const s of campSessions) {
    events.push({
      id: s.campId,
      sessionId: s.id,
      type: "camp",
      occurrence: s.startsAtUtc.toISOString(),
      title: `☀️ ${s.camp.name}${s.title ? ` · ${s.title}` : ""}`,
      startsAtUtc: s.startsAtUtc.toISOString(),
      durationMin: s.durationMin,
      published: s.camp.published,
      status: s.camp.status,
      cancelStatus: null,
      personName: s.camp.name,
      personImage: null,
      campColor: "coral",
    });
  }

  events.sort((a, b) => new Date(a.startsAtUtc).getTime() - new Date(b.startsAtUtc).getTime());
  return NextResponse.json(events);
}


