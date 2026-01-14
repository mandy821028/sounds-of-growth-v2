"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SimpleHtmlEditor from "./SimpleHtmlEditor";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { useLocale, useTranslations } from "next-intl";
import { useToast } from "@/components/ui/toast-provider";

type Resource = { id: string; title: string; contentHtml: string; links?: string[] };

export default function LessonResourcesPage() {
  const [items, setItems] = useState<Resource[]>([]);
  const [title, setTitle] = useState("");
  const [html, setHtml] = useState("");
  const [links, setLinks] = useState<string>("");
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const t = useTranslations("teacherLessons");
  const tCommon = useTranslations("common");
  const { show } = useToast();
  const locale = useLocale() as 'en'|'es';
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  async function load() {
    if (!id) return;
    const res = await fetch(`/api/lessons/${id}/resources`, { cache: 'no-store' });
    if (res.ok) setItems(await res.json());
    const res2 = await fetch(`/api/lessons/${id}`, { cache: 'no-store' });
    if (res2.ok) {
      const l = await res2.json();
      setLessonTitle(`${l.classType?.name ?? 'Class'} · ${l.durationMin}m`);
    }
  }
  useEffect(() => { if (id) load(); }, [id]);

  function isHtmlEmpty(input: string) {
    const tmp = document.createElement('div');
    tmp.innerHTML = input || '';
    const text = (tmp.textContent || '').replace(/\u200B/g, '').trim();
    // Consider only <br> or empty tags as empty content
    const onlyBreaks = tmp.innerHTML.replace(/\s+/g,'').replace(/<br\/?>(?=)/g,'').length === 0;
    return text.length === 0 && onlyBreaks;
  }

  async function create() {
    setError(null);
    setSaving(true);
    const linksArr = links.split("\n").map(s => s.trim()).filter(Boolean);
    const t = title.trim();
    const h = html.trim();
    if (!t) { setError(useTranslations("teacherLessons")("titleRequired")); setSaving(false); return; }
    if (!h || isHtmlEmpty(h)) { setError(useTranslations("teacherLessons")("contentRequired")); setSaving(false); return; }
    try {
      if (editingId) {
        const res = await fetch(`/api/lessons/resources/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: t, contentHtml: h, links: linksArr }) });
        if (!res.ok) throw new Error();
        setEditingId(null); setTitle(""); setHtml(""); setLinks(""); await load();
      } else {
        if (!id) return;
        const res = await fetch(`/api/lessons/${id}/resources`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: t, contentHtml: h, links: linksArr }) });
        if (!res.ok) throw new Error();
        setTitle(""); setHtml(""); setLinks(""); await load();
      }
      show(tCommon("success"), "success");
    } catch {
      show(tCommon("error"), "error");
      setError(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-semibold">{t("resourcesTitle")} — {lessonTitle}</h1>
      <div className="border border-default rounded p-3 bg-card space-y-2">
        <input className="w-full border rounded px-3 py-2" placeholder={t("titleRequired")} value={title} onChange={(e)=>setTitle(e.target.value)} />
        <div>
          <div className="text-sm text-gray-600 mb-1">{t("content")}</div>
          <SimpleHtmlEditor value={html} onChange={setHtml} lang={locale} />
        </div>
        <textarea className="w-full border rounded px-3 py-2" placeholder={t("oneLinkPerLine") as any} value={links} onChange={(e)=>setLinks(e.target.value)} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2">
          <button className="border px-3 py-2 rounded disabled:opacity-50" disabled={saving} onClick={create}>{editingId ? t("saveChanges") : t("addResource")}</button>
          {editingId && (
            <button className="border px-3 py-2 rounded" onClick={()=>{ setEditingId(null); setTitle(""); setHtml(""); setLinks(""); }}>{t("cancel")}</button>
          )}
        </div>
      </div>

      <ul className="space-y-3">
        {items.map((r)=> (
          <li key={r.id} className="border border-default rounded p-3 bg-card">
            <div className="font-semibold mb-2">{r.title}</div>
            <div className="prose" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(r.contentHtml) }} />
            {r.links && r.links.length>0 && (
              <ul className="mt-2 list-disc pl-5">
                {r.links.map((u, i)=>(<li key={i}><a className="text-blue-600 underline" href={u} target="_blank" rel="noreferrer">{u}</a></li>))}
              </ul>
            )}
            <div className="mt-2 flex gap-2">
              <button className="border px-2 py-1 rounded" onClick={()=>{ setEditingId(r.id); setTitle(r.title); setHtml(r.contentHtml); setLinks((r.links||[]).join('\n')); }}>{t("edit")}</button>
              <button className="border px-2 py-1 rounded" onClick={async ()=>{ if(!confirm(t("deleteResourceConfirm"))) return; await fetch(`/api/lessons/resources/${r.id}`, { method: 'DELETE' }); await load(); }}>{t("delete")}</button>
            </div>
          </li>
        ))}
        {items.length===0 && <li className="text-sm text-gray-600">{t("noResources")}</li>}
      </ul>
    </div>
  );
}


