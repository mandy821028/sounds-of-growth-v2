"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-provider";

type Camp = {
  id: string;
  name: string;
  focus?: string | null;
  ageMin?: number | null;
  ageMax?: number | null;
  startDate: string;
  endDate: string;
  capacity: number;
  published: boolean;
  status: string;
  _count: { enrollments: number; sessions: number };
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  IN_PROGRESS: "En curso",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-primary/15 text-primary",
  IN_PROGRESS: "bg-teal-bright/15 text-teal-bright",
  COMPLETED: "bg-secondary text-secondary-foreground",
  CANCELLED: "bg-destructive/15 text-destructive",
};

export default function SummerCampsPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const { show } = useToast();

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/summer-camps", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setCamps(await res.json());
    } catch {
      show("Error cargando camps", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function deleteCamp(id: string, name: string) {
    if (!confirm(`¿Eliminar el camp "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`/api/summer-camps/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      show("Camp eliminado", "success");
      load();
    } catch {
      show("Error al eliminar", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-eyebrow mb-1">Teacher</p>
          <h1 className="font-heading text-3xl font-light">Summer Camps</h1>
        </div>
        <Button asChild>
          <Link href="/teacher/summer-camps/new">+ Nuevo camp</Link>
        </Button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Spinner /> Cargando…
        </div>
      )}

      {!loading && camps.length === 0 && (
        <div className="playful-card px-6 py-12 text-center text-muted-foreground">
          <p className="font-heading text-2xl font-light mb-2">Sin camps todavía</p>
          <p className="font-body text-sm">Crea tu primer Summer Camp para empezar.</p>
          <Button asChild className="mt-4">
            <Link href="/teacher/summer-camps/new">Crear primer camp</Link>
          </Button>
        </div>
      )}

      <ul className="space-y-3">
        {camps.map((camp) => (
          <li key={camp.id} className="playful-card playful-card-hover px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-heading text-xl font-medium">{camp.name}</h2>
                  <span className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[camp.status] ?? "bg-muted"}`}>
                    {STATUS_LABEL[camp.status] ?? camp.status}
                  </span>
                  {!camp.published && (
                    <span className="text-xs font-body px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Oculto</span>
                  )}
                </div>
                <div className="font-body text-sm text-muted-foreground flex flex-wrap gap-3">
                  {camp.focus && <span>🎵 {camp.focus}</span>}
                  {(camp.ageMin != null || camp.ageMax != null) && (
                    <span>👦 {camp.ageMin ?? "?"} – {camp.ageMax ?? "?"} años</span>
                  )}
                  <span>📅 {new Date(camp.startDate).toLocaleDateString()} → {new Date(camp.endDate).toLocaleDateString()}</span>
                  <span>🎓 {camp._count.enrollments} / {camp.capacity} alumnos</span>
                  <span>📚 {camp._count.sessions} sesiones</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/teacher/summer-camps/${camp.id}`}>Ver detalle</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/teacher/summer-camps/${camp.id}/edit`}>Editar</Link>
                </Button>
                <Button
                  variant="outline" size="sm"
                  className="text-destructive hover:border-destructive/40"
                  onClick={() => deleteCamp(camp.id, camp.name)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
