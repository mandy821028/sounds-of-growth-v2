"use client";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-provider";

type Student = { id: string; user: { firstName: string; lastName: string; image?: string | null } };
type Resource = { id: string; title: string };
type Session = { id: string; title?: string | null; startsAtUtc: string; durationMin: number; order: number; resources: Resource[] };
type Enrollment = { id: string; status: string; student: Student };
type Camp = {
  id: string; name: string; description?: string | null; focus?: string | null;
  ageMin?: number | null; ageMax?: number | null; startDate: string; endDate: string;
  capacity: number; priceUsd: number; address?: string | null; published: boolean;
  status: string; locale: string; sessions: Session[]; enrollments: Enrollment[];
  _count: { enrollments: number };
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-primary/15 text-primary",
  IN_PROGRESS: "bg-teal-bright/15 text-teal-bright",
  COMPLETED: "bg-secondary text-secondary-foreground",
  CANCELLED: "bg-destructive/15 text-destructive",
};

export default function CampDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [camp, setCamp] = useState<Camp | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollStudentId, setEnrollStudentId] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const { show } = useToast();

  async function load() {
    setLoading(true);
    try {
      const [campRes, studentsRes] = await Promise.all([
        fetch(`/api/summer-camps/${id}`, { cache: "no-store" }),
        fetch("/api/students", { cache: "no-store" }),
      ]);
      if (!campRes.ok) throw new Error();
      setCamp(await campRes.json());
      if (studentsRes.ok) setStudents(await studentsRes.json());
    } catch {
      show("Error cargando datos", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function enroll() {
    if (!enrollStudentId) return;
    setEnrolling(true);
    try {
      const res = await fetch(`/api/summer-camps/${id}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: enrollStudentId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Error");
      }
      show("Alumno inscrito", "success");
      setEnrollStudentId("");
      load();
    } catch (e: any) {
      show(e.message ?? "Error al inscribir", "error");
    } finally {
      setEnrolling(false);
    }
  }

  async function unenroll(enrollmentId: string, name: string) {
    if (!confirm(`¿Dar de baja a ${name}?`)) return;
    try {
      await fetch(`/api/summer-camps/${id}/enrollments/${enrollmentId}`, { method: "DELETE" });
      show("Alumno dado de baja", "success");
      load();
    } catch {
      show("Error", "error");
    }
  }

  async function deleteSession(sessionId: string) {
    if (!confirm("¿Eliminar esta sesión?")) return;
    try {
      await fetch(`/api/summer-camps/${id}/sessions/${sessionId}`, { method: "DELETE" });
      show("Sesión eliminada", "success");
      load();
    } catch {
      show("Error", "error");
    }
  }

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Spinner /> Cargando…</div>;
  if (!camp) return <div className="text-destructive">Camp no encontrado</div>;

  const activeEnrollments = camp.enrollments.filter((e) => e.status === "ACTIVE");
  const enrolledIds = new Set(activeEnrollments.map((e) => e.student.id));
  const availableStudents = students.filter((s) => !enrolledIds.has(s.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="section-eyebrow mb-1">Summer Camp</p>
          <h1 className="font-heading text-3xl font-light">{camp.name}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs font-body font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[camp.status] ?? "bg-muted"}`}>
              {camp.status}
            </span>
            {!camp.published && (
              <span className="text-xs font-body px-2.5 py-1 rounded-full bg-muted text-muted-foreground">Oculto</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/teacher/summer-camps/${id}/edit`}>Editar camp</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/teacher/summer-camps">← Volver</Link>
          </Button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Fechas", value: `${new Date(camp.startDate).toLocaleDateString()} → ${new Date(camp.endDate).toLocaleDateString()}` },
          { label: "Enfoque", value: camp.focus ?? "—" },
          { label: "Edades", value: (camp.ageMin != null || camp.ageMax != null) ? `${camp.ageMin ?? "?"} – ${camp.ageMax ?? "?"} años` : "—" },
          { label: "Inscritos", value: `${activeEnrollments.length} / ${camp.capacity}` },
        ].map((item) => (
          <div key={item.label} className="playful-card px-4 py-3 text-center">
            <p className="section-eyebrow mb-1">{item.label}</p>
            <p className="font-body font-medium text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      {camp.description && (
        <div className="playful-card px-5 py-4">
          <p className="font-body text-sm text-muted-foreground">{camp.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sesiones */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-light">Sesiones ({camp.sessions.length})</h2>
            <Button asChild size="sm">
              <Link href={`/teacher/summer-camps/${id}/sessions/new`}>+ Sesión</Link>
            </Button>
          </div>

          {camp.sessions.length === 0 ? (
            <div className="playful-card px-5 py-8 text-center text-muted-foreground font-body text-sm">
              Aún no hay sesiones. Añade la primera.
            </div>
          ) : (
            <ul className="space-y-2">
              {camp.sessions.map((s, i) => (
                <li key={s.id} className="playful-card px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-body font-medium text-sm">
                        Sesión {i + 1}{s.title ? ` — ${s.title}` : ""}
                      </p>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">
                        {new Date(s.startsAtUtc).toLocaleString()} · {s.durationMin} min
                      </p>
                      {s.resources.length > 0 && (
                        <p className="font-body text-xs text-teal-bright mt-0.5">
                          {s.resources.length} recurso{s.resources.length !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/teacher/summer-camps/${id}/sessions/${s.id}/resources`}>Recursos</Link>
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        className="text-destructive hover:border-destructive/40"
                        onClick={() => deleteSession(s.id)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Alumnos inscritos */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-light">Alumnos inscritos ({activeEnrollments.length})</h2>

          {/* Inscribir alumno */}
          {availableStudents.length > 0 && (
            <div className="flex gap-2">
              <select
                className="flex-1 rounded-lg border border-input bg-[var(--input-bg,var(--card))] px-3 py-2 font-body text-sm"
                value={enrollStudentId}
                onChange={(e) => setEnrollStudentId(e.target.value)}
              >
                <option value="">Seleccionar alumno…</option>
                {availableStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.user.firstName} {s.user.lastName}
                  </option>
                ))}
              </select>
              <Button onClick={enroll} disabled={!enrollStudentId || enrolling} size="sm">
                {enrolling ? <Spinner /> : "Inscribir"}
              </Button>
            </div>
          )}
          {availableStudents.length === 0 && activeEnrollments.length === 0 && (
            <p className="font-body text-sm text-muted-foreground">No hay alumnos disponibles para inscribir.</p>
          )}

          {activeEnrollments.length === 0 ? (
            <div className="playful-card px-5 py-8 text-center text-muted-foreground font-body text-sm">
              Ningún alumno inscrito todavía.
            </div>
          ) : (
            <ul className="space-y-2">
              {activeEnrollments.map((e) => (
                <li key={e.id} className="playful-card px-4 py-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={e.student.user.image ?? "/avatar-placeholder.svg"}
                      alt=""
                      className="w-8 h-8 rounded-full border border-border/60 object-cover"
                    />
                    <span className="font-body text-sm font-medium">
                      {e.student.user.firstName} {e.student.user.lastName}
                    </span>
                  </div>
                  <Button
                    variant="outline" size="sm"
                    className="text-destructive hover:border-destructive/40"
                    onClick={() => unenroll(e.id, `${e.student.user.firstName} ${e.student.user.lastName}`)}
                  >
                    Dar de baja
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
