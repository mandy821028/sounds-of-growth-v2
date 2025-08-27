"use client";
import { useEffect, useMemo, useState } from "react";

export default function NewLessonPage() {
  const [students, setStudents] = useState<Array<any>>([]);
  const [classTypes, setClassTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [studentId, setStudentId] = useState("");
  const [classTypeId, setClassTypeId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [durationMin, setDurationMin] = useState("30");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [recurring, setRecurring] = useState(false);
  const [recurrenceEnd, setRecurrenceEnd] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [useStudentAddr, setUseStudentAddr] = useState(false);
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [published, setPublished] = useState(false);

  const lang = useMemo(() => (document.cookie.includes("locale=es") ? "es" : "en"), []);

  useEffect(() => {
    (async () => {
      const s = await fetch("/api/students").then((r) => r.json());
      setStudents(s);
      const ct = await fetch("/api/class-types").then((r) => r.json());
      setClassTypes(ct);
    })();
  }, []);

  // naive autocomplete using existing geo endpoints
  const [preds, setPreds] = useState<Array<{ description: string; place_id: string }>>([]);
  useEffect(() => {
    const c = new AbortController();
    const q = address.trim();
    if (!q) { setPreds([]); return; }
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geo/autocomplete?q=${encodeURIComponent(q)}&lang=${lang}`, { signal: c.signal });
        const data = await res.json();
        setPreds((data?.predictions ?? []).map((p: any) => ({ description: p.description, place_id: p.place_id })));
      } catch {}
    }, 250);
    return () => { c.abort(); clearTimeout(id); };
  }, [address, lang]);

  async function pickPlace(pid: string, desc: string) {
    setAddress(desc);
    setPreds([]);
    try {
      const res = await fetch(`/api/geo/details?placeId=${pid}&lang=${lang}`);
      const data = await res.json();
      const loc = data?.result?.geometry?.location;
      if (loc) { setLat(loc.lat); setLng(loc.lng); }
    } catch {}
  }

  async function create() {
    const startsAtUtc = new Date(`${date}T${time}:00`);
    const priceValue = Number(priceUsd);
    if (Number.isNaN(priceValue) || priceUsd.trim() === "") {
      alert(lang === "es" ? "Ingresa el precio en USD" : "Enter the price in USD");
      return;
    }
    const payload: any = {
      studentId,
      classTypeId,
      startsAtUtc: startsAtUtc.toISOString(),
      durationMin,
      timezone,
      priceUsd: priceValue,
      published,
    };
    if (recurring) {
      payload.recurrence = "WEEKLY";
      payload.recurrenceEndUtc = recurrenceEnd ? new Date(`${recurrenceEnd}T23:59:59`).toISOString() : undefined;
    }
    if (useStudentAddr) {
      const st = students.find((x) => x.id === studentId);
      if (st?.address) {
        payload.address = st.address;
        payload.lat = st.lat;
        payload.lng = st.lng;
      }
    } else if (address) {
      payload.address = address;
      payload.lat = lat;
      payload.lng = lng;
    }

    const res = await fetch("/api/lessons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) window.location.href = "/teacher/lessons";
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-3">
      <h1 className="text-2xl font-semibold mb-4">{lang === "es" ? "Nueva clase (individual)" : "New lesson (individual)"}</h1>
      <select className="w-full border rounded px-3 py-2" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
        <option value="">{lang === "es" ? "Selecciona alumno" : "Select student"}</option>
        {students.map((s) => <option key={s.id} value={s.id}>{`${s.user.firstName} ${s.user.lastName}`}</option>)}
      </select>
      <select className="w-full border rounded px-3 py-2" value={classTypeId} onChange={(e) => setClassTypeId(e.target.value)}>
        <option value="">{lang === "es" ? "Tipo de clase" : "Class type"}</option>
        {classTypes.map((ct) => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
      </select>
      {/* Inline create ClassType */}
      <InlineAddClassType onCreated={(ct) => { setClassTypes((prev) => [...prev, ct]); setClassTypeId(ct.id); }} />
      <div className="grid grid-cols-2 gap-2">
        <input className="border rounded px-3 py-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className="border rounded px-3 py-2" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <select className="w-full border rounded px-3 py-2" value={durationMin} onChange={(e) => setDurationMin(e.target.value)}>
        <option value="30">30 min</option>
        <option value="45">45 min</option>
        <option value="60">1 h</option>
      </select>
      <input className="w-full border rounded px-3 py-2" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
      <div className="flex items-center gap-2">
        <input id="rec" type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
        <label htmlFor="rec">{lang === "es" ? "Repetir semanalmente" : "Repeat weekly"}</label>
      </div>
      {recurring && (
        <input className="w-full border rounded px-3 py-2" type="date" value={recurrenceEnd} onChange={(e) => setRecurrenceEnd(e.target.value)} placeholder={lang === "es" ? "Fin (opcional)" : "End (optional)"} />
      )}
      <input className="w-full border rounded px-3 py-2" type="number" min="0" step="0.01" value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} placeholder={lang === "es" ? "Precio (USD)" : "Price (USD)"} />
      <div className="flex items-center gap-2">
        <input id="useaddr" type="checkbox" checked={useStudentAddr} onChange={(e) => setUseStudentAddr(e.target.checked)} />
        <label htmlFor="useaddr">{lang === "es" ? "Usar dirección del alumno" : "Use student's address"}</label>
      </div>
      {!useStudentAddr && (
        <div className="relative">
          <input className="w-full border rounded px-3 py-2" placeholder={lang === "es" ? "Dirección (autocompletar)" : "Address (autocomplete)"} value={address} onChange={(e) => setAddress(e.target.value)} />
          {preds.length > 0 && (
            <ul className="absolute z-[60] mt-1 w-full bg-white border rounded shadow">
              {preds.map((p) => (
                <li key={p.place_id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => pickPlace(p.place_id, p.description)}>
                  {p.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input id="pub" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        <label htmlFor="pub">{lang === "es" ? "Publicar en calendario" : "Publish to calendar"}</label>
      </div>
      <button className="w-full bg-black text-white py-2 rounded" onClick={create}>{lang === "es" ? "Crear" : "Create"}</button>
    </div>
  );
}

function InlineAddClassType({ onCreated }: { onCreated: (ct: { id: string; name: string }) => void }) {
  const [name, setName] = useState("");
  const lang = useMemo(() => (document.cookie.includes("locale=es") ? "es" : "en"), []);
  async function add() {
    if (!name.trim()) return;
    const res = await fetch("/api/class-types", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim() }) });
    if (res.ok) {
      const ct = await res.json();
      onCreated(ct);
      setName("");
    }
  }
  return (
    <div className="flex items-center gap-2">
      <input className="flex-1 border rounded px-3 py-2" placeholder={lang === 'es' ? 'Nuevo tipo de clase' : 'New class type'} value={name} onChange={(e) => setName(e.target.value)} />
      <button className="border px-3 py-2 rounded" type="button" onClick={add}>{lang === 'es' ? 'Añadir' : 'Add'}</button>
    </div>
  );
}


