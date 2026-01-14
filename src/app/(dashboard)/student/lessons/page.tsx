import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function StudentLessonsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";
  const t = await getTranslations("studentLessons");

  const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
  if (!student) return <div className="p-6">No data</div>;
  const lessons = await prisma.lesson.findMany({
    where: { studentId: student.id, published: true },
    include: { classType: true, teacher: { include: { user: true } } },
    orderBy: { startsAtUtc: "asc" },
  });

  const dtfDate = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const dtfTime = new Intl.DateTimeFormat(locale, { timeStyle: "short" });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' });

  return (
    <div className="px-4 py-6 space-y-4">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <div className="space-y-2">
        {lessons.map((l) => (
          <div key={l.id} className="border border-default rounded p-3 bg-card flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm text-gray-500">{t("type")}</div>
              <div className="font-medium">{l.classType.name}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-sm text-gray-500">{t("teacher")}</div>
              <div className="font-medium">{l.teacher.user.firstName} {l.teacher.user.lastName}</div>
            </div>
            <div className="space-y-0.5 text-right">
              <div className="text-sm text-gray-500">{t("date")}</div>
              <div className="flex items-center justify-end gap-2">
                <div className="font-medium">{l.recurrence ? (locale==='es' ? `Todos los ${weekday.format(l.startsAtUtc)}` : `Every ${weekday.format(l.startsAtUtc)}`) : dtfDate.format(l.startsAtUtc)}</div>
                {l.recurrence && (
                  <span className={`text-xs px-2 py-1 rounded ${l.recurrence === 'BIWEEKLY' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                    {locale==='es' ? (l.recurrence === 'BIWEEKLY' ? 'Quincenal' : 'Semanal') : (l.recurrence === 'BIWEEKLY' ? 'Biweekly' : 'Weekly')}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-0.5 text-right">
              <div className="text-sm text-gray-500">{t("time")}</div>
              <div className="font-medium">{dtfTime.format(l.startsAtUtc)}</div>
            </div>
            <div>
              <a className="border px-3 py-2 rounded" href={`/student/lessons/${l.id}/resources`}>{t("viewResources")}</a>
            </div>
          </div>
        ))}
        {lessons.length === 0 && <div className="text-gray-500">—</div>}
      </div>
    </div>
  );
}


