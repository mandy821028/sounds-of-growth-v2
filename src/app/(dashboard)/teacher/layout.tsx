import Link from "next/link";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import SidebarNav from "@/components/sidebar-nav";

export default async function TeacherSectionLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";
  const t = {
    students: locale === "es" ? "Alumnos" : "Students",
    lessons: locale === "es" ? "Clases individuales" : "Individual lessons",
    groups: locale === "es" ? "Clases grupales" : "Group lessons",
    summerCamps: locale === "es" ? "Summer Camps ☀️" : "Summer Camps ☀️",
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
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 grid grid-cols-12 gap-6">
      <aside className="col-span-12 md:col-span-3">
        <SidebarNav
          items={[
            { label: t.students, href: "/teacher" },
            { label: t.lessons, href: "/teacher/lessons" },
            { label: t.requests, href: "/teacher/lessons/requests", badgeCount: pendingCount || 0 },
            { label: t.groups, href: "#", disabled: true },
            { label: t.summerCamps, href: "/teacher/summer-camps" },
            { label: t.calendar, href: "/calendar" },
          ]}
        />
      </aside>
      <section className="col-span-12 md:col-span-9 min-w-0">
        {children}
      </section>
    </div>
  );
}


