"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type LessonListItem = {
  id: string;
  durationMin: number;
  startsAtUtc: string;
  published: boolean;
  status: string;
  classType?: { name: string } | null;
  student?: { user?: { firstName?: string; lastName?: string; image?: string } | null } | null;
  recurrence?: "WEEKLY" | "BIWEEKLY" | null;
};

export default function LessonsListPage() {
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [status, setStatus] = useState<string>("ALL");
  const [pub, setPub] = useState<string>("ALL");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const t = useTranslations("teacherLessons");
  const tCommon = useTranslations("common");
  const { show } = useToast();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (status !== 'ALL') params.set('status', status);
        if (pub !== 'ALL') params.set('published', pub);
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        if (q) params.set('q', q);
        const qs = params.toString();
        const url = `/api/lessons${qs ? `?${qs}` : ''}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        setLessons(await res.json());
        const newUrl = `/teacher/lessons${qs ? `?${qs}` : ''}`;
        if (typeof window !== 'undefined') window.history.replaceState(null, '', newUrl);
      } catch {
        show(tCommon("error"), "error");
      } finally {
        setLoading(false);
      }
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
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <Button asChild>
          <Link href="/teacher/lessons/new">+ {t("new")}</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
        <select className="border rounded px-2 py-1" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ALL">{t("allStatuses")}</option>
          <option value="CREATED">Created</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select className="border rounded px-2 py-1" value={pub} onChange={(e) => setPub(e.target.value)}>
          <option value="ALL">All visibility</option>
          <option value="YES">{t("published")}</option>
          <option value="NO">{t("draft")}</option>
        </select>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Input placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {loading && <div className="text-sm text-gray-500 inline-flex items-center gap-2"><Spinner /> {tCommon("loading")}</div>}
      <ul className="space-y-2">
        {filtered.map((l: LessonListItem) => (
          <li key={l.id} className="border border-default rounded p-3 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{l.classType?.name ?? "Class"} · {l.durationMin}m · {(new Date(l.startsAtUtc)).toLocaleString()}</div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <img src={l.student?.user?.image ?? "/avatar-placeholder.svg"} alt="avatar" className="w-6 h-6 rounded-full border object-cover" />
                  <span>{l.student?.user?.firstName} {l.student?.user?.lastName}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {l.recurrence && (
                  <span className={`text-xs px-2 py-1 rounded ${l.recurrence === 'BIWEEKLY' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                    {l.recurrence === 'BIWEEKLY' ? 'Biweekly' : 'Weekly'}
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded ${l.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{l.published ? t("published") : t("draft")}</span>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={`/teacher/lessons/${l.id}/edit`}>{t("edit")}</a>
              </Button>
              <Button
                variant="outline" size="sm"
                onClick={async () => {
                  if (!confirm(t("confirmDelete"))) return;
                  try {
                    const r = await fetch(`/api/lessons/${l.id}`, { method: 'DELETE' });
                    if (!r.ok) throw new Error();
                    show(tCommon("success"), "success");
                    location.reload();
                  } catch {
                    show(tCommon("error"), "error");
                  }
                }}
              >
                {t("delete")}
              </Button>
              <Button
                variant="outline" size="sm"
                onClick={async () => {
                  try {
                    const r = await fetch(`/api/lessons/${l.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: !l.published }) });
                    if (!r.ok) throw new Error();
                    show(tCommon("success"), "success");
                    location.reload();
                  } catch {
                    show(tCommon("error"), "error");
                  }
                }}
              >
                {l.published ? t("unpublish") : t("publish")}
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={`/teacher/lessons/${l.id}/resources`}>{tCommon("resources")}</a>
              </Button>
            </div>
          </li>
        ))}
        {filtered.length === 0 && <li className="text-sm text-gray-600">{t("noLessons")}</li>}
      </ul>
    </div>
  );
}


