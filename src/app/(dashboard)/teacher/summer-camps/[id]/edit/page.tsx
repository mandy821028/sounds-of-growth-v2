"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-provider";

const FOCUS_OPTIONS = ["Piano", "Voice / Voz", "General Music / Música General", "Guitar / Guitarra", "Violin", "Otro"];
const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Borrador" },
  { value: "PUBLISHED", label: "Publicado" },
  { value: "IN_PROGRESS", label: "En curso" },
  { value: "COMPLETED", label: "Finalizado" },
  { value: "CANCELLED", label: "Cancelado" },
];

function toLocalInput(iso: string) {
  const d = new Date(iso);
  return { date: d.toISOString().slice(0, 10), time: d.toISOString().slice(11, 16) };
}

export default function EditCampPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
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
  const [locale, setLocale] = useState<"en" | "es">("en");
  const [status, setStatus] = useState("DRAFT");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/summer-camps/${id}`, { cache: "no-store" });
      if (!res.ok) { show("Error cargando camp", "error"); return; }
      const camp = await res.json();
      setName(camp.name);
      setDescription(camp.description ?? "");
      setFocus(camp.focus ?? "");
      setAgeMin(camp.ageMin != null ? String(camp.ageMin) : "");
      setAgeMax(camp.ageMax != null ? String(camp.ageMax) : "");
      const { date: sd, time: st } = toLocalInput(camp.startDate);
      setStartDate(sd); setStartTime(st);
      const { date: ed, time: et } = toLocalInput(camp.endDate);
      setEndDate(ed); setEndTime(et);
      setCapacity(String(camp.capacity));
      setPriceUsd(String(camp.priceUsd));
      setAddress(camp.address ?? "");
      setLocale(camp.locale ?? "en");
      setStatus(camp.status);
      setPublished(camp.published);
      setLoading(false);
    })();
  }, [id]);

  async function save() {
    if (!name.trim() || !startDate || !endDate) {
      show("Nombre, fecha inicio y fin son obligatorios", "error");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        description: description.trim() || null,
        focus: focus || null,
        ageMin: ageMin !== "" ? Number(ageMin) : null,
        ageMax: ageMax !== "" ? Number(ageMax) : null,
        startDate: new Date(`${startDate}T${startTime}:00`).toISOString(),
        endDate: new Date(`${endDate}T${endTime}:00`).toISOString(),
        capacity: Number(capacity) || 10,
        priceUsd: Number(priceUsd) || 0,
        address: address.trim() || null,
        locale,
        status,
        published,
      };
      const res = await fetch(`/api/summer-camps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      show("Camp actualizado", "success");
      router.push(`/teacher/summer-camps/${id}`);
    } catch {
      show("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Spinner /> Cargando…</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="section-eyebrow mb-1">Teacher · Summer Camps</p>
        <h1 className="font-heading text-3xl font-light">Editar Camp</h1>
      </div>

      <div className="playful-card px-6 py-6 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="desc">Descripción</Label>
          <textarea
            id="desc" rows={3}
            className="w-full rounded-lg border border-input bg-[var(--input-bg,var(--card))] px-3 py-2 font-body text-sm resize-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
            value={description} onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1 space-y-1.5">
            <Label>Enfoque</Label>
            <select className="w-full rounded-lg border border-input bg-[var(--input-bg,var(--card))] px-3 py-2 font-body text-sm" value={focus} onChange={(e) => setFocus(e.target.value)}>
              <option value="">Sin especificar</option>
              {FOCUS_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Edad mín</Label>
            <Input type="number" min="0" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Edad máx</Label>
            <Input type="number" min="0" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
          </div>
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Capacidad</Label>
            <Input type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Precio (USD)</Label>
            <Input type="number" min="0" step="0.01" value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Dirección</Label>
          <Input placeholder="Sounds of Growth Studio, Houston, TX" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Idioma</Label>
            <select className="w-full rounded-lg border border-input bg-[var(--input-bg,var(--card))] px-3 py-2 font-body text-sm" value={locale} onChange={(e) => setLocale(e.target.value as "en" | "es")}>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <select className="w-full rounded-lg border border-input bg-[var(--input-bg,var(--card))] px-3 py-2 font-body text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input id="published" type="checkbox" className="rounded" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          <Label htmlFor="published">Publicado (visible para alumnos)</Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1" onClick={save} disabled={saving}>
          {saving ? <><Spinner /> Guardando…</> : "Guardar cambios"}
        </Button>
        <Button variant="outline" onClick={() => router.push(`/teacher/summer-camps/${id}`)}>Cancelar</Button>
      </div>
    </div>
  );
}
