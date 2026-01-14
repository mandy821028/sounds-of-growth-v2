"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/toast-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

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
  const [recurrenceType, setRecurrenceType] = useState<'WEEKLY'|'BIWEEKLY'>('WEEKLY');
  const [recurrenceEnd, setRecurrenceEnd] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [useStudentAddr, setUseStudentAddr] = useState(false);
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  const t = useTranslations("teacherLessons");
  const tCommon = useTranslations("common");
  const { show } = useToast();
  const lang = useMemo(() => (typeof document !== 'undefined' && document.cookie.includes("locale=es") ? "es" : "en"), []);

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
    if (!studentId || !classTypeId || !date || !time) {
      show(tCommon("error"), "error");
      return;
    }
    if (Number.isNaN(priceValue) || priceUsd.trim() === "") {
      show(t("invalidPrice"), "error");
      return;
    }
    setSaving(true);
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
      payload.recurrence = recurrenceType;
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

    try {
      const res = await fetch("/api/lessons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      show(tCommon("success"), "success");
      window.location.href = "/teacher/lessons";
    } catch {
      show(tCommon("error"), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-3">
      <h1 className="text-2xl font-semibold mb-4">{t("newTitle")}</h1>
      <div>
        <Label htmlFor="student">{t("student")}</Label>
        <select id="student" className="w-full border rounded px-3 py-2 mt-1" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          <option value="">{t("selectStudent")}</option>
          {students.map((s) => <option key={s.id} value={s.id}>{`${s.user.firstName} ${s.user.lastName}`}</option>)}
        </select>
      </div>
      <div>
        <Label htmlFor="classType">{t("classType")}</Label>
        <select id="classType" className="w-full border rounded px-3 py-2 mt-1" value={classTypeId} onChange={(e) => setClassTypeId(e.target.value)}>
          <option value="">{t("selectType")}</option>
          {classTypes.map((ct) => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
        </select>
      </div>
      {/* Inline create ClassType */}
      <InlineAddClassType onCreated={(ct) => { setClassTypes((prev) => [...prev, ct]); setClassTypeId(ct.id); }} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="date">{t("date")}</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="time">{t("time")}</Label>
          <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="duration">{t("duration")}</Label>
        <select id="duration" className="w-full border rounded px-3 py-2 mt-1" value={durationMin} onChange={(e) => setDurationMin(e.target.value)}>
          <option value="30">30 min</option>
          <option value="45">45 min</option>
          <option value="60">1 h</option>
        </select>
      </div>
      <div>
        <Label htmlFor="timezone">{t("timezone")}</Label>
        <Input id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <input id="rec" type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
        <Label htmlFor="rec">{t("repeat")}</Label>
      </div>
      {recurring && (
        <>
          <div>
            <Label htmlFor="recType">{t("frequency")}</Label>
            <select id="recType" className="w-full border rounded px-3 py-2 mt-1" value={recurrenceType} onChange={(e)=>setRecurrenceType(e.target.value as any)}>
              <option value="WEEKLY">{t("weekly")}</option>
              <option value="BIWEEKLY">{t("biweekly")}</option>
            </select>
          </div>
          <div>
            <Label htmlFor="recEnd">{t("endOptional")}</Label>
            <Input id="recEnd" type="date" value={recurrenceEnd} onChange={(e) => setRecurrenceEnd(e.target.value)} />
          </div>
        </>
      )}
      <div>
        <Label htmlFor="price">{t("priceUsd")}</Label>
        <Input id="price" type="number" min="0" step="0.01" value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <input id="useaddr" type="checkbox" checked={useStudentAddr} onChange={(e) => setUseStudentAddr(e.target.checked)} />
        <Label htmlFor="useaddr">{t("useStudentAddress")}</Label>
      </div>
      {!useStudentAddr && (
        <div className="relative">
          <Label htmlFor="address">{t("address")}</Label>
          <Input id="address" placeholder={t("addressAutocomplete")} value={address} onChange={(e) => setAddress(e.target.value)} />
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
        <Label htmlFor="pub">{t("publishToCalendar")}</Label>
      </div>
      <Button className="w-full" disabled={saving} onClick={create}>
        {saving ? (<span className="inline-flex items-center gap-2"><Spinner /> {tCommon("loading")}</span>) : t("create")}
      </Button>
    </div>
  );
}

function InlineAddClassType({ onCreated }: { onCreated: (ct: { id: string; name: string }) => void }) {
  const [name, setName] = useState("");
  const t = useTranslations("teacherLessons");
  const tCommon = useTranslations("common");
  const { show } = useToast();
  async function add() {
    if (!name.trim()) return;
    try {
      const res = await fetch("/api/class-types", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim() }) });
      if (!res.ok) throw new Error();
      const ct = await res.json();
      onCreated(ct);
      setName("");
      show(tCommon("success"), "success");
    } catch {
      show(tCommon("error"), "error");
    }
  }
  return (
    <div>
      <Label htmlFor="newClassType">{t("newClassType")}</Label>
      <div className="flex items-center gap-2">
        <Input id="newClassType" className="flex-1" placeholder={t("newClassType")} value={name} onChange={(e) => setName(e.target.value)} />
        <Button variant="outline" type="button" onClick={add}>{t("add")}</Button>
      </div>
    </div>
  );
}


