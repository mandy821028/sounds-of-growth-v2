"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-provider";

type Camp = {
  id: string;
  name: string;
  description?: string | null;
  focus?: string | null;
  ageMin?: number | null;
  ageMax?: number | null;
  startDate: string;
  endDate: string;
  capacity: number;
  address?: string | null;
  status: string;
  _count: { enrollments: number; sessions: number };
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-primary/15 text-primary",
  IN_PROGRESS: "bg-teal-bright/15 text-teal-bright",
  COMPLETED: "bg-secondary text-secondary-foreground",
  CANCELLED: "bg-destructive/15 text-destructive",
};

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: "Inscrito",
  IN_PROGRESS: "En curso",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
  DRAFT: "Borrador",
};

export default function StudentSummerCampsPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const { show } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/summer-camps", { cache: "no-store" });
        if (!res.ok) throw new Error();
        setCamps(await res.json());
      } catch {
        show("Error cargando camps", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Spinner /> Cargando…</div>;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-eyebrow mb-1">Mi cuenta</p>
        <h1 className="font-heading text-3xl font-light">Summer Camps</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">Camps en los que estás inscrito.</p>
      </div>

      {camps.length === 0 && (
        <div className="playful-card px-6 py-12 text-center text-muted-foreground">
          <p className="font-heading text-2xl font-light mb-2">Sin camps todavía</p>
          <p className="font-body text-sm">Tu teacher te inscribirá cuando haya un camp disponible.</p>
        </div>
      )}

      <ul className="space-y-3">
        {camps.map((camp) => (
          <li key={camp.id}>
            <Link href={`/student/summer-camps/${camp.id}`} className="block playful-card playful-card-hover px-6 py-4 group">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-heading text-xl font-medium group-hover:text-primary transition-colors">{camp.name}</h2>
                    <span className={`text-xs font-body font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLOR[camp.status] ?? "bg-muted"}`}>
                      {STATUS_LABEL[camp.status] ?? camp.status}
                    </span>
                  </div>
                  <div className="font-body text-sm text-muted-foreground flex flex-wrap gap-3">
                    {camp.focus && <span>🎵 {camp.focus}</span>}
                    <span>📅 {new Date(camp.startDate).toLocaleDateString()} → {new Date(camp.endDate).toLocaleDateString()}</span>
                    <span>📚 {camp._count.sessions} sesiones</span>
                    {camp.address && <span>📍 {camp.address}</span>}
                  </div>
                  {camp.description && (
                    <p className="font-body text-xs text-muted-foreground line-clamp-2 mt-1">{camp.description}</p>
                  )}
                </div>
                <span className="font-body text-sm text-primary font-medium shrink-0 group-hover:underline">Ver detalle →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
