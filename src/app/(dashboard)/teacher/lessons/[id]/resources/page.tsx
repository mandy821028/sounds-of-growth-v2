"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SimpleHtmlEditor from "./SimpleHtmlEditor";
import { sanitizeRichHtml } from "@/lib/sanitize";

type Resource = { id: string; title: string; contentHtml: string; links?: string[] };

export default function LessonResourcesPage() {
  const [items, setItems] = useState<Resource[]>([]);
  const [title, setTitle] = useState("");
  const [html, setHtml] = useState("");
  const [links, setLinks] = useState<string>("");
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [lang, setLang] = useState<'en'|'es'>(() => (typeof document !== 'undefined' && document.cookie.includes('locale=es')) ? 'es' : 'en');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
  useEffect(() => {
    const onLocale = () => setLang(document.cookie.includes('locale=es') ? 'es' : 'en');
    if (typeof window !== 'undefined') {
      window.addEventListener('locale-change', onLocale);
      return () => window.removeEventListener('locale-change', onLocale);
    }
  }, []);

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
    const linksArr = links.split("\n").map(s => s.trim()).filter(Boolean);
    const t = title.trim();
    const h = html.trim();
    if (!t) { setError(lang==='es' ? 'El título es obligatorio' : 'Title is required'); return; }
    if (!h || isHtmlEmpty(h)) { setError(lang==='es' ? 'El contenido es obligatorio' : 'Content is required'); return; }
    if (editingId) {
      const res = await fetch(`/api/lessons/resources/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: t, contentHtml: h, links: linksArr }) });
      if (res.ok) { setEditingId(null); setTitle(""); setHtml(""); setLinks(""); await load(); }
      else { try { const j = await res.json(); setError(j?._errors?.join?.(" ") || 'Error'); } catch { setError('Error'); } }
    } else {
      if (!id) return;
      const res = await fetch(`/api/lessons/${id}/resources`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: t, contentHtml: h, links: linksArr }) });
      if (res.ok) { setTitle(""); setHtml(""); setLinks(""); await load(); }
      else { try { const j = await res.json(); setError(j?._errors?.join?.(" ") || 'Error'); } catch { setError('Error'); } }
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-semibold">{lang==='es' ? 'Recursos' : 'Resources'} — {lessonTitle}</h1>
      <div className="border rounded p-3 space-y-2">
        <input className="w-full border rounded px-3 py-2" placeholder={lang==='es'?'Título':'Title'} value={title} onChange={(e)=>setTitle(e.target.value)} />
        <div>
          <div className="text-sm text-gray-600 mb-1">{lang==='es'?'Contenido':'Content'}</div>
          <SimpleHtmlEditor value={html} onChange={setHtml} lang={lang} />
        </div>
        <textarea className="w-full border rounded px-3 py-2" placeholder={lang==='es'?"Un enlace por línea (opcional)":"One link per line (optional)"} value={links} onChange={(e)=>setLinks(e.target.value)} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2">
          <button className="border px-3 py-2 rounded" onClick={create}>{editingId ? (lang==='es'?'Guardar cambios':'Save changes') : (lang==='es'?'Agregar recurso':'Add resource')}</button>
          {editingId && (
            <button className="border px-3 py-2 rounded" onClick={()=>{ setEditingId(null); setTitle(""); setHtml(""); setLinks(""); }}>{lang==='es'?'Cancelar':'Cancel'}</button>
          )}
        </div>
      </div>

      <ul className="space-y-3">
        {items.map((r)=> (
          <li key={r.id} className="border rounded p-3">
            <div className="font-semibold mb-2">{r.title}</div>
            <div className="prose" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(r.contentHtml) }} />
            {r.links && r.links.length>0 && (
              <ul className="mt-2 list-disc pl-5">
                {r.links.map((u, i)=>(<li key={i}><a className="text-blue-600 underline" href={u} target="_blank" rel="noreferrer">{u}</a></li>))}
              </ul>
            )}
            <div className="mt-2 flex gap-2">
              <button className="border px-2 py-1 rounded" onClick={()=>{ setEditingId(r.id); setTitle(r.title); setHtml(r.contentHtml); setLinks((r.links||[]).join('\n')); }}>{lang==='es'?'Editar':'Edit'}</button>
              <button className="border px-2 py-1 rounded" onClick={async ()=>{ if(!confirm(lang==='es'?'¿Eliminar este recurso?':'Delete this resource?')) return; await fetch(`/api/lessons/resources/${r.id}`, { method: 'DELETE' }); await load(); }}>{lang==='es'?'Eliminar':'Delete'}</button>
            </div>
          </li>
        ))}
        {items.length===0 && <li className="text-sm text-gray-600">{lang==='es'?'Aún no hay recursos':'No resources yet'}</li>}
      </ul>
    </div>
  );
}


