import Link from "next/link";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export default async function TeacherSectionLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";
  const t = {
    students: locale === "es" ? "Alumnos" : "Students",
    empty: locale === "es" ? "" : "",
    lessons: locale === "es" ? "Clases individuales" : "Individual lessons",
    groups: locale === "es" ? "Clases grupales" : "Group lessons",
    calendar: locale === "es" ? "Calendario" : "Calendar",
    requests: locale === "es" ? "Solicitudes" : "Requests",
  };
  // count pending requests for this teacher
  const session = await getServerSession(authOptions);
  let pendingCount = 0;
  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: (session?.user as any)?.id } });
    if (teacher) {
      pendingCount = await prisma.lessonCancellationRequest.count({ where: { status: "PENDING", lesson: { teacherId: teacher.id } } });
    }
  } catch {}
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
      <aside className="col-span-12 md:col-span-3">
        <nav className="space-y-2">
          <Link className="block border rounded px-3 py-2" href="/teacher">{t.students}</Link>
          <Link className="block border rounded px-3 py-2" href="/teacher/lessons">{t.lessons}</Link>
          <Link className="block border rounded px-3 py-2 flex items-center justify-between" href="/teacher/lessons/requests">
            <span>{t.requests}</span>
            {pendingCount > 0 && <span className="text-xs bg-amber-100 text-amber-700 rounded px-2 py-0.5">{pendingCount}</span>}
          </Link>
          <Link className="block border rounded px-3 py-2 opacity-60 pointer-events-none" href="#">{t.groups}</Link>
          <Link className="block border rounded px-3 py-2" href="/calendar">{t.calendar}</Link>
        </nav>
      </aside>
      <section className="col-span-12 md:col-span-9">
        {children}
      </section>
    </div>
  );
}


