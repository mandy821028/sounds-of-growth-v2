"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/toast-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function EditLessonPage({ params }: { params: { id: string } }) {
  const [lesson, setLesson] = useState<any>(null);
  const [classTypes, setClassTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [saving, setSaving] = useState(false);
  const t = useTranslations("teacherLessons");
  const tCommon = useTranslations("common");
  const { show } = useToast();

  useEffect(() => {
    (async () => {
      const l = await fetch(`/api/lessons/${params.id}`).then(r => r.json());
      setLesson(l);
      const ct = await fetch(`/api/class-types`).then(r => r.json());
      setClassTypes(ct);
    })();
  }, [params.id]);

  if (!lesson) return <div className="p-8 inline-flex items-center gap-2"><Spinner /> {tCommon("loading")}</div>;

  async function save() {
    setSaving(true);
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
    try {
      const res = await fetch(`/api/lessons/${lesson.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      show(tCommon("success"), "success");
      window.location.href = `/teacher/lessons/${lesson.id}`;
    } catch {
      show(tCommon("error"), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-3">
      <h1 className="text-2xl font-semibold">{t("editTitle")}</h1>
      <select className="w-full border rounded px-3 py-2" value={lesson.classTypeId} onChange={(e) => setLesson({ ...lesson, classTypeId: e.target.value })}>
        {classTypes.map((ct) => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
      </select>
      <Input type="datetime-local" value={new Date(lesson.startsAtUtc).toISOString().slice(0,16)} onChange={(e) => setLesson({ ...lesson, startsAtUtc: new Date(e.target.value).toISOString() })} />
      <select className="w-full border rounded px-3 py-2" value={lesson.durationMin} onChange={(e) => setLesson({ ...lesson, durationMin: Number(e.target.value) })}>
        <option value={30}>30 min</option>
        <option value={45}>45 min</option>
        <option value={60}>1 h</option>
      </select>
      <Input value={lesson.timezone} onChange={(e) => setLesson({ ...lesson, timezone: e.target.value })} />
      <Input type="number" step="0.01" value={lesson.priceUsd} onChange={(e) => setLesson({ ...lesson, priceUsd: e.target.value })} />
      <Input placeholder="Address" value={lesson.address ?? ''} onChange={(e) => setLesson({ ...lesson, address: e.target.value })} />
      <Button className="w-full" disabled={saving} onClick={save}>{saving ? (<span className="inline-flex items-center gap-2"><Spinner /> {tCommon("loading")}</span>) : t("save")}</Button>
    </div>
  );
}


