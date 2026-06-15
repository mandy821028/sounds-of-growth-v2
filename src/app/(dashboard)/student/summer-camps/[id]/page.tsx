"use client";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-provider";

type Link_T = { label: string; url: string };
type Resource = { id: string; title: string; contentHtml: string; links: Link_T[] | null };
type Session = { id: string; title?: string | null; startsAtUtc: string; durationMin: number; order: number; resources: Resource[] };
type Camp = {
  id: string; name: string; description?: string | null; focus?: string | null;
  ageMin?: number | null; ageMax?: number | null; startDate: string; endDate: string;
  priceUsd: number; address?: string | null; status: string;
  sessions: Session[]; _count: { enrollments: number };
};

export default function StudentCampDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [camp, setCamp] = useState<Camp | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const { show } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/summer-camps/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error();
        setCamp(await res.json());
      } catch {
        show("Error cargando camp", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Spinner /> Cargando…</div>;
  if (!camp) return <div className="text-destructive">Camp no encontrado o no estás inscrito.</div>;

  const now = new Date();
  const upcomingSessions = camp.sessions.filter((s) => new Date(s.startsAtUtc) >= now);
  const pastSessions = camp.sessions.filter((s) => new Date(s.startsAtUtc) < now);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-eyebrow mb-1">Summer Camps</p>
          <h1 className="font-heading text-3xl font-light">{camp.name}</h1>
        </div>
        <Link href="/student/summer-camps" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Mis camps
        </Link>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Fechas", value: `${new Date(camp.startDate).toLocaleDateString()} → ${new Date(camp.endDate).toLocaleDateString()}` },
          { label: "Enfoque", value: camp.focus ?? "—" },
          { label: "Sesiones", value: String(camp.sessions.length) },
          { label: "Sede", value: camp.address ? camp.address.split(",")[0] : "Por confirmar" },
        ].map((item) => (
          <div key={item.label} className="playful-card px-4 py-3 text-center">
            <p className="section-eyebrow mb-1">{item.label}</p>
            <p className="font-body font-medium text-foreground text-sm">{item.value}</p>
          </div>
        ))}
      </div>

      {camp.description && (
        <div className="playful-card px-5 py-4">
          <p className="font-body text-sm text-muted-foreground">{camp.description}</p>
        </div>
      )}

      {/* Sesiones próximas */}
      {upcomingSessions.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-light">Próximas sesiones</h2>
          <SessionList sessions={upcomingSessions} expanded={expandedSessionId} onToggle={setExpandedSessionId} />
        </section>
      )}

      {/* Sesiones pasadas */}
      {pastSessions.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-light text-muted-foreground">Sesiones pasadas</h2>
          <SessionList sessions={pastSessions} expanded={expandedSessionId} onToggle={setExpandedSessionId} past />
        </section>
      )}

      {camp.sessions.length === 0 && (
        <div className="playful-card px-6 py-10 text-center text-muted-foreground font-body text-sm">
          Las sesiones aún no han sido programadas. ¡Pronto aparecerán aquí!
        </div>
      )}
    </div>
  );
}

function SessionList({
  sessions, expanded, onToggle, past,
}: {
  sessions: Session[]; expanded: string | null; onToggle: (id: string | null) => void; past?: boolean;
}) {
  return (
    <ul className="space-y-2">
      {sessions.map((s, i) => {
        const open = expanded === s.id;
        return (
          <li key={s.id} className={`playful-card overflow-hidden transition-all ${past ? "opacity-70" : ""}`}>
            <button
              className="w-full flex items-center justify-between px-5 py-3.5 text-left gap-3"
              onClick={() => onToggle(open ? null : s.id)}
            >
              <div>
                <p className="font-body font-medium text-sm">
                  Sesión {i + 1}{s.title ? ` — ${s.title}` : ""}
                </p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  {new Date(s.startsAtUtc).toLocaleString()} · {s.durationMin} min
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {s.resources.length > 0 && (
                  <span className="text-xs font-body px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {s.resources.length} recurso{s.resources.length !== 1 ? "s" : ""}
                  </span>
                )}
                <span className="text-muted-foreground text-sm">{open ? "▲" : "▼"}</span>
              </div>
            </button>

            {open && (
              <div className="border-t border-border/50 px-5 py-4 space-y-3">
                {s.resources.length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground">Sin recursos por ahora.</p>
                ) : (
                  s.resources.map((r) => (
                    <div key={r.id} className="space-y-2">
                      <p className="font-body font-semibold text-sm">{r.title}</p>
                      {r.contentHtml && (
                        <div
                          className="font-body text-sm text-foreground/80 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: r.contentHtml }}
                        />
                      )}
                      {r.links && r.links.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {r.links.map((l, li) => (
                            <a
                              key={li} href={l.url} target="_blank" rel="noreferrer"
                              className="text-xs font-body text-primary hover:underline bg-primary/8 px-2.5 py-1 rounded-full border border-primary/20"
                            >
                              🔗 {l.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
