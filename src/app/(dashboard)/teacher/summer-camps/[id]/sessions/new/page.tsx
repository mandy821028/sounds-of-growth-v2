"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-provider";

export default function NewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { show } = useToast();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [durationMin, setDurationMin] = useState("60");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Chicago");
  const [order, setOrder] = useState("0");

  async function save() {
    if (!date || !time) { show("Fecha y hora son obligatorios", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        title: title.trim() || undefined,
        startsAtUtc: new Date(`${date}T${time}:00`).toISOString(),
        durationMin: Number(durationMin) || 60,
        timezone,
        order: Number(order) || 0,
      };
      const res = await fetch(`/api/summer-camps/${id}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      show("Sesión creada", "success");
      router.push(`/teacher/summer-camps/${id}`);
    } catch {
      show("Error al crear sesión", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <p className="section-eyebrow mb-1">Teacher · Summer Camps · Sesiones</p>
        <h1 className="font-heading text-3xl font-light">Nueva Sesión</h1>
      </div>

      <div className="playful-card px-6 py-6 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Título (opcional)</Label>
          <Input id="title" placeholder="Ej: Clase de Teoría Musical" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Fecha *</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Hora *</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Duración</Label>
          <select
            className="w-full rounded-lg border border-input bg-[var(--input-bg,var(--card))] px-3 py-2 font-body text-sm"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
          >
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">1 h</option>
            <option value="90">1 h 30 min</option>
            <option value="120">2 h</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label>Zona horaria</Label>
          <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Orden (posición en la lista)</Label>
          <Input type="number" min="0" value={order} onChange={(e) => setOrder(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1" onClick={save} disabled={saving}>
          {saving ? <><Spinner /> Guardando…</> : "Crear Sesión"}
        </Button>
        <Button variant="outline" onClick={() => router.push(`/teacher/summer-camps/${id}`)}>Cancelar</Button>
      </div>
    </div>
  );
}
