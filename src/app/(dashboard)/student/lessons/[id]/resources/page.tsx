"use client";
import { useEffect, useState } from "react";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { useParams } from "next/navigation";

type Resource = { id: string; title: string; contentHtml: string; links?: string[] };

export default function LessonResourcesStudentPage() {
  const [items, setItems] = useState<Resource[]>([]);
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  useEffect(() => {
    (async () => {
      if (!id) return;
      const res = await fetch(`/api/lessons/${id}/resources`, { cache: 'no-store' });
      if (res.ok) setItems(await res.json());
    })();
  }, [id]);

  const lang: 'en' | 'es' = (typeof document !== 'undefined' && document.cookie.includes('locale=es')) ? 'es' : 'en';
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-semibold">{lang==='es' ? 'Recursos' : 'Resources'}</h1>
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
          </li>
        ))}
        {items.length===0 && <li className="text-sm text-gray-600">{lang==='es' ? 'No hay recursos' : 'No resources'}</li>}
      </ul>
    </div>
  );
}


