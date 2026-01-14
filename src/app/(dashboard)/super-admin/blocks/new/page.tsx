"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPES = ["HERO", "CHALLENGE", "CURVED_ROW", "GRID_CARDS", "AUDIO_LIST", "SPOTLIGHT", "EVENTS", "NEWSLETTER"];

export default function NewBlockPage() {
  const router = useRouter();
  const [type, setType] = useState("HERO");
  const [path, setPath] = useState("/");
  const [locale, setLocale] = useState<"en"|"es">((document?.cookie||"").includes("locale=es") ? "es" : "en");
  const [position, setPosition] = useState(0);
  const [data, setData] = useState<string>('{}');
  const [published, setPublished] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [audParents, setAudParents] = useState(false);
  const [audStudents, setAudStudents] = useState(false);
  const [audTeachers, setAudTeachers] = useState(false);

  async function create() {
    setError(null);
    let json: any = {};
    try { json = JSON.parse(data || "{}"); } catch { setError("JSON inválido"); return; }
    const audiences = [audParents && "PARENTS", audStudents && "STUDENTS", audTeachers && "TEACHERS"].filter(Boolean);
    const res = await fetch("/api/page-blocks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, path, locale, position, data: json, audiences: audiences.length ? audiences : null, published }) });
    if (res.ok) router.replace("/super-admin/blocks");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">New Block</h1>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">Type
          <select className="w-full border border-default rounded px-2 py-1 bg-card" value={type} onChange={(e)=>setType(e.target.value)}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="text-sm">Position
          <input className="w-full border border-default rounded px-2 py-1 bg-card" type="number" value={position} onChange={(e)=>setPosition(parseInt(e.target.value||"0"))} />
        </label>
        <label className="text-sm">Path
          <input className="w-full border border-default rounded px-2 py-1 bg-card" value={path} onChange={(e)=>setPath(e.target.value)} />
        </label>
        <label className="text-sm">Locale
          <select className="w-full border border-default rounded px-2 py-1 bg-card" value={locale} onChange={(e)=>setLocale(e.target.value as any)}>
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
        </label>
        <label className="text-sm col-span-full">Data (JSON)
          <textarea className="w-full min-h-[160px] border border-default rounded px-2 py-1 bg-card font-mono text-sm" value={data} onChange={(e)=>setData(e.target.value)} />
        </label>
        <fieldset className="text-sm col-span-full">
          <legend className="mb-1">Audiences (empty = All)</legend>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-1"><input type="checkbox" checked={audParents} onChange={(e)=>setAudParents(e.target.checked)} />Parents</label>
            <label className="inline-flex items-center gap-1"><input type="checkbox" checked={audStudents} onChange={(e)=>setAudStudents(e.target.checked)} />Students</label>
            <label className="inline-flex items-center gap-1"><input type="checkbox" checked={audTeachers} onChange={(e)=>setAudTeachers(e.target.checked)} />Teachers</label>
          </div>
        </fieldset>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={published} onChange={(e)=>setPublished(e.target.checked)} /> Published
        </label>
      </div>
      {error && <div className="text-sm text-red-500">{error}</div>}
      <div className="flex gap-2">
        <button className="border border-default rounded px-3 py-2 hover:bg-primary/10" onClick={create}>Create</button>
        <button className="border border-default rounded px-3 py-2" onClick={()=>router.back()}>Cancel</button>
      </div>
    </div>
  );
}

