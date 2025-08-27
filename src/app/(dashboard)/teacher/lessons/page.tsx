"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type LessonListItem = {
  id: string;
  durationMin: number;
  startsAtUtc: string;
  published: boolean;
  status: string;
  classType?: { name: string } | null;
  student?: { user?: { firstName?: string; lastName?: string; image?: string } | null } | null;
};

export default function LessonsListPage() {
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [status, setStatus] = useState<string>("ALL");
  const [pub, setPub] = useState<string>("ALL");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [q, setQ] = useState<string>("");

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams();
      if (status !== 'ALL') params.set('status', status);
      if (pub !== 'ALL') params.set('published', pub);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (q) params.set('q', q);
      const qs = params.toString();
      const url = `/api/lessons${qs ? `?${qs}` : ''}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) setLessons(await res.json());
      const newUrl = `/teacher/lessons${qs ? `?${qs}` : ''}`;
      if (typeof window !== 'undefined') window.history.replaceState(null, '', newUrl);
    })();
  }, [status, pub, from, to, q]);

  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      if (status !== "ALL" && l.status !== status) return false;
      if (pub !== "ALL" && l.published !== (pub === "YES")) return false;
      if (from && new Date(l.startsAtUtc) < new Date(`${from}T00:00:00`)) return false;
      if (to && new Date(l.startsAtUtc) > new Date(`${to}T23:59:59`)) return false;
      if (q) {
        const term = q.toLowerCase();
        const txt = `${l.classType?.name ?? ''} ${l.student?.user?.firstName ?? ''} ${l.student?.user?.lastName ?? ''}`.toLowerCase();
        if (!txt.includes(term)) return false;
      }
      return true;
    });
  }, [lessons, status, pub, from, to, q]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Lessons</h1>
        <Link className="border px-3 py-2 rounded" href="/teacher/lessons/new">New lesson</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
        <select className="border rounded px-2 py-1" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ALL">All statuses</option>
          <option value="CREATED">Created</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select className="border rounded px-2 py-1" value={pub} onChange={(e) => setPub(e.target.value)}>
          <option value="ALL">All visibility</option>
          <option value="YES">Published</option>
          <option value="NO">Draft</option>
        </select>
        <input className="border rounded px-2 py-1" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input className="border rounded px-2 py-1" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ul className="space-y-2">
        {filtered.map((l: LessonListItem) => (
          <li key={l.id} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{l.classType?.name ?? "Class"} · {l.durationMin}m · {(new Date(l.startsAtUtc)).toLocaleString()}</div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <img src={l.student?.user?.image ?? "/avatar-placeholder.svg"} alt="avatar" className="w-6 h-6 rounded-full border object-cover" />
                  <span>{l.student?.user?.firstName} {l.student?.user?.lastName}</span>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${l.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{l.published ? "Published" : "Draft"}</span>
            </div>
            <div className="mt-2 flex gap-2">
              <a className="border px-2 py-1 rounded" href={`/teacher/lessons/${l.id}/edit`}>Edit</a>
              <button className="border px-2 py-1 rounded" onClick={async () => { if (!confirm('Delete this class and all its occurrences?')) return; await fetch(`/api/lessons/${l.id}`, { method: 'DELETE' }); location.reload(); }}>Delete</button>
              <button className="border px-2 py-1 rounded" onClick={async () => { await fetch(`/api/lessons/${l.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: !l.published }) }); location.reload(); }}>{l.published ? 'Unpublish' : 'Publish'}</button>
            </div>
          </li>
        ))}
        {filtered.length === 0 && <li className="text-sm text-gray-600">No lessons found</li>}
      </ul>
    </div>
  );
}


