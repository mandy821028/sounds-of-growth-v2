import { headers, cookies } from "next/headers";
import RequestCancelButton from "./RequestCancelButton.client";
import { getTranslations } from "next-intl/server";

async function fetchLesson(id: string, occ?: string) {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const base = `${proto}://${host}`;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${encodeURIComponent(c.value)}`).join("; ");
  const qs = occ ? `?occ=${encodeURIComponent(occ)}` : '';
  const res = await fetch(`${base}/api/lessons/${id}${qs}`, { cache: "no-store", headers: { cookie: cookieHeader } });
  if (!res.ok) return null;
  return res.json();
}

export default async function StudentLessonDetailPage({ params, searchParams }: { params: { id: string }, searchParams: { occ?: string } }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";
  const t = await getTranslations("studentLessons");
  const occ = searchParams?.occ;
  const lesson = await fetchLesson(params.id, occ);
  if (!lesson) return <div className="p-8">{t("notFound")}</div>;
  const when = occ ? new Date(occ) : new Date(lesson.startsAtUtc);
  const dt = new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short" }).format(when);
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
      <h1 className="text-2xl font-semibold">{lesson.classType?.name} · {lesson.durationMin}m</h1>
      <div className="text-sm text-gray-600">{dt} · {lesson.timezone}</div>
      <div className="text-sm flex items-center gap-2">{t("teacher")}: <img src={lesson.teacher?.user?.image ?? '/avatar-placeholder.svg'} alt="avatar" className="w-6 h-6 rounded-full border object-cover" /> {lesson.teacher?.user?.firstName} {lesson.teacher?.user?.lastName}</div>
      <div className="text-sm">{t("price")}: ${ (Number(lesson.priceUsd) || 0).toFixed(2) }</div>
      {lesson.address && <div className="text-sm">{t("location")}: {lesson.address}</div>}
      <div className="mt-4">
        <a className="border px-3 py-2 rounded" href={`/student/lessons/${lesson.id}/resources`}>{t("viewResources")}</a>
      </div>
      {lesson.cancelStatus === 'APPROVED' ? (
        <div className="mt-4 text-sm text-red-600">{t("cancelledInfo")}</div>
      ) : lesson.cancelStatus === 'PENDING' ? (
        <div className="mt-4 text-sm text-amber-600">{t("pendingInfo")}</div>
      ) : (
        <div className="mt-4">
          {/* Client button to request cancellation */}
          <RequestCancelButton lessonId={lesson.id} occurrenceIso={when.toISOString()} />
        </div>
      )}
    </div>
  );
}

// end


