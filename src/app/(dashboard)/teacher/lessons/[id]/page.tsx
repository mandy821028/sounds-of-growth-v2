import { headers, cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

async function fetchLesson(id: string) {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const base = `${proto}://${host}`;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${encodeURIComponent(c.value)}`).join("; ");
  const res = await fetch(`${base}/api/lessons/${id}`, { cache: "no-store", headers: { cookie: cookieHeader } });
  if (!res.ok) return null;
  return res.json();
}

export default async function LessonDetailPage({ params, searchParams }: { params: { id: string }, searchParams: { occ?: string } }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";
  const tTeacher = await getTranslations("teacherLessons");
  const tStudent = await getTranslations("studentLessons");
  const lesson = await fetchLesson(params.id);
  if (!lesson) return <div className="p-8">Not found</div>;
  const occ = searchParams?.occ;
  const when = occ ? new Date(occ) : new Date(lesson.startsAtUtc);
  const dt = new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short" }).format(when);
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
      <h1 className="text-2xl font-semibold">{lesson.classType?.name} · {lesson.durationMin}m</h1>
      <div className="text-sm text-gray-600">{dt} · {lesson.timezone}</div>
      <div className="text-sm flex items-center gap-2">{tTeacher("student")}: <img src={lesson.student?.user?.image ?? '/avatar-placeholder.svg'} alt="avatar" className="w-6 h-6 rounded-full border object-cover" /> {lesson.student?.user?.firstName} {lesson.student?.user?.lastName}</div>
      <div className="text-sm">{tStudent("price")}: ${ (Number(lesson.priceUsd) || 0).toFixed(2) }</div>
      {lesson.address && <div className="text-sm">{tStudent("location")}: {lesson.address}</div>}
      {lesson.cancelStatus && (
        <div className={`text-sm ${lesson.cancelStatus==='APPROVED'?'text-red-600':'text-amber-600'}`}>Cancel status: {lesson.cancelStatus}</div>
      )}
      <div className="mt-4">
        <a className="border px-3 py-2 rounded inline-block" href={`/teacher/lessons/${lesson.id}/edit`}>{tTeacher("editTitle")}</a>
      </div>
      {lesson.cancelRequests?.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold">{tTeacher("cancellations")}</h2>
          <ul className="mt-2 space-y-1">
            {lesson.cancelRequests.map((r: any) => (
              <li key={r.id} className="text-sm text-gray-700 flex items-center justify-between">
                <span>{new Date(r.requestedDateUtc).toLocaleString()} · {r.status} · {r.reason || ''}</span>
                {r.status === 'PENDING' && (
                  <span className="flex gap-2">
                    <button className="border px-2 py-1 rounded" onClick={async () => { await fetch(`/api/lessons/cancel-requests/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'APPROVE' }) }); location.reload(); }}>{tTeacher("approve")}</button>
                    <button className="border px-2 py-1 rounded" onClick={async () => { await fetch(`/api/lessons/cancel-requests/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'REJECT' }) }); location.reload(); }}>{tTeacher("reject")}</button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


