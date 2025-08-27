"use client";
import { useEffect, useState } from "react";

export default function EditLessonPage({ params }: { params: { id: string } }) {
  const [lesson, setLesson] = useState<any>(null);
  const [classTypes, setClassTypes] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    (async () => {
      const l = await fetch(`/api/lessons/${params.id}`).then(r => r.json());
      setLesson(l);
      const ct = await fetch(`/api/class-types`).then(r => r.json());
      setClassTypes(ct);
    })();
  }, [params.id]);

  if (!lesson) return <div className="p-8">Loading...</div>;

  async function save() {
    const body: any = {
      classTypeId: lesson.classTypeId,
      startsAtUtc: new Date(lesson.startsAtUtc).toISOString(),
      durationMin: Number(lesson.durationMin),
      timezone: lesson.timezone,
      priceUsd: Number(lesson.priceUsd),
      address: lesson.address ?? null,
      lat: lesson.lat ?? null,
      lng: lesson.lng ?? null,
    };
    const res = await fetch(`/api/lessons/${lesson.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) window.location.href = `/teacher/lessons/${lesson.id}`;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-3">
      <h1 className="text-2xl font-semibold">Edit lesson</h1>
      <select className="w-full border rounded px-3 py-2" value={lesson.classTypeId} onChange={(e) => setLesson({ ...lesson, classTypeId: e.target.value })}>
        {classTypes.map((ct) => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
      </select>
      <input className="w-full border rounded px-3 py-2" type="datetime-local" value={new Date(lesson.startsAtUtc).toISOString().slice(0,16)} onChange={(e) => setLesson({ ...lesson, startsAtUtc: new Date(e.target.value).toISOString() })} />
      <select className="w-full border rounded px-3 py-2" value={lesson.durationMin} onChange={(e) => setLesson({ ...lesson, durationMin: Number(e.target.value) })}>
        <option value={30}>30 min</option>
        <option value={45}>45 min</option>
        <option value={60}>1 h</option>
      </select>
      <input className="w-full border rounded px-3 py-2" value={lesson.timezone} onChange={(e) => setLesson({ ...lesson, timezone: e.target.value })} />
      <input className="w-full border rounded px-3 py-2" type="number" step="0.01" value={lesson.priceUsd} onChange={(e) => setLesson({ ...lesson, priceUsd: e.target.value })} />
      <input className="w-full border rounded px-3 py-2" placeholder="Address" value={lesson.address ?? ''} onChange={(e) => setLesson({ ...lesson, address: e.target.value })} />
      <button className="w-full bg-black text-white py-2 rounded" onClick={save}>Save</button>
    </div>
  );
}


