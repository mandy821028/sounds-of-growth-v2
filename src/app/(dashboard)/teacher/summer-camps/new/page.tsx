"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-provider";

const FOCUS_OPTIONS = ["Piano", "Voice / Voz", "General Music / Música General", "Guitar / Guitarra", "Violin", "Otro"];

export default function NewCampPage() {
  const router = useRouter();
  const { show } = useToast();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [focus, setFocus] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("12:00");
  const [capacity, setCapacity] = useState("10");
  const [priceUsd, setPriceUsd] = useState("0");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [locale, setLocale] = useState<"en" | "es">("en");
  const [published, setPublished] = useState(false);
  const [preds, setPreds] = useState<Array<{ description: string; place_id: string }>>([]);

  async function searchAddress(q: string) {
    setAddress(q);
    if (!q.trim()) { setPreds([]); return; }
    try {
      const res = await fetch(`/api/geo/autocomplete?q=${encodeURIComponent(q)}&lang=${locale}`);
      const data = await res.json();
      setPreds((data?.predictions ?? []).slice(0, 5).map((p: any) => ({ description: p.description, place_id: p.place_id })));
    } catch {}
  }

  async function pickPlace(pid: string, desc: string) {
    setAddress(desc);
    setPreds([]);
    try {
      const res = await fetch(`/api/geo/details?placeId=${pid}&lang=${locale}`);
      const data = await res.json();
      const loc = data?.result?.geometry?.location;
      if (loc) { setLat(loc.lat); setLng(loc.lng); }
    } catch {}
  }

  async function save() {
    if (!name.trim() || !startDate || !endDate) {
      show("Nombre, fecha inicio y fin son obligatorios", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        focus: focus || undefined,
        ageMin: ageMin ? Number(ageMin) : undefined,
        ageMax: ageMax ? Number(ageMax) : undefined,
        startDate: new Date(`${startDate}T${startTime}:00`).toISOString(),
        endDate: new Date(`${endDate}T${endTime}:00`).toISOString(),
        capacity: Number(capacity) || 10,
        priceUsd: Number(priceUsd) || 0,
        address: address || undefined,
        lat,
        lng,
        locale,
        published,
      };
      const res = await fetch("/api/summer-camps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const camp = await res.json();
      show("Camp creado correctamente", "success");
      router.push(`/teacher/summer-camps/${camp.id}`);
    } catch {
      show("Error al crear el camp", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="section-eyebrow mb-1">Teacher · Summer Camps</p>
        <h1 className="font-heading text-3xl font-light">Nuevo Summer Camp</h1>
      </div>

      <div className="playful-card px-6 py-6 space-y-5">
        {/* Nombre */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre del camp *</Label>
          <Input id="name" placeholder="Ej: Summer Music Camp 2026 (5–8 años)" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {/* Descripción */}
        <div className="space-y-1.5">
          <Label htmlFor="desc">Descripción</Label>
          <textarea
            id="desc"
            rows={3}
            className="w-full rounded-lg border border-input bg-[var(--input-bg,var(--card))] px-3 py-2 font-body text-sm resize-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
            placeholder="Una semana de música, creatividad y diversión…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Enfoque y edades */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1 space-y-1.5">
            <Label htmlFor="focus">Instrumento / Enfoque</Label>
            <select
              id="focus"
              className="w-full rounded-lg border border-input bg-[var(--input-bg,var(--card))] px-3 py-2 font-body text-sm"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
            >
              <option value="">Sin especificar</option>
              {FOCUS_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ageMin">Edad mínima</Label>
            <Input id="ageMin" type="number" min="0" max="99" placeholder="5" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ageMax">Edad máxima</Label>
            <Input id="ageMax" type="number" min="0" max="99" placeholder="8" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Inicio *</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Fin *</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Capacidad y precio */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="capacity">Capacidad (nº alumnos)</Label>
            <Input id="capacity" type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Precio (USD)</Label>
            <Input id="price" type="number" min="0" step="0.01" value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} />
          </div>
        </div>

        {/* Dirección de la sede */}
        <div className="space-y-1.5">
          <Label htmlFor="address">Dirección de la sede</Label>
          <div className="relative">
            <Input
              id="address"
              placeholder="Sounds of Growth Studio, Houston, TX…"
              value={address}
              onChange={(e) => searchAddress(e.target.value)}
            />
            {preds.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                {preds.map((p) => (
                  <li
                    key={p.place_id}
                    className="px-4 py-2.5 font-body text-sm cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => pickPlace(p.place_id, p.description)}
                  >
                    {p.description}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Idioma */}
        <div className="space-y-1.5">
          <Label htmlFor="locale">Idioma del camp</Label>
          <select
            id="locale"
            className="w-full rounded-lg border border-input bg-[var(--input-bg,var(--card))] px-3 py-2 font-body text-sm"
            value={locale}
            onChange={(e) => setLocale(e.target.value as "en" | "es")}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>

        {/* Publicar */}
        <div className="flex items-center gap-2">
          <input id="published" type="checkbox" className="rounded" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          <Label htmlFor="published">Publicar (visible para alumnos)</Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1" onClick={save} disabled={saving}>
          {saving ? <><Spinner /> Guardando…</> : "Crear Summer Camp"}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </div>
  );
}
