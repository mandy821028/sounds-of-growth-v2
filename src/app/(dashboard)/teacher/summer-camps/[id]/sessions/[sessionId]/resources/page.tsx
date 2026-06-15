"use client";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-provider";

type Resource = {
  id: string;
  title: string;
  contentHtml: string;
  links: Array<{ label: string; url: string }> | null;
};

type LinkItem = { label: string; url: string };

export default function SessionResourcesPage({ params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { id, sessionId } = use(params);
  const { show } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([{ label: "", url: "" }]);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/summer-camps/${id}/sessions/${sessionId}/resources`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      setResources(await res.json());
    } catch {
      show("Error cargando recursos", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id, sessionId]);

  function startEdit(r: Resource) {
    setEditId(r.id);
    setTitle(r.title);
    setContentHtml(r.contentHtml);
    setLinks(r.links?.length ? r.links : [{ label: "", url: "" }]);
  }

  function resetForm() {
    setEditId(null);
    setTitle("");
    setContentHtml("");
    setLinks([{ label: "", url: "" }]);
  }

  async function save() {
    if (!title.trim()) { show("El título es obligatorio", "error"); return; }
    setSaving(true);
    try {
      const cleanLinks = links.filter((l) => l.label.trim() && l.url.trim());
      const payload = { title: title.trim(), contentHtml, links: cleanLinks };
      const url = editId
        ? `/api/summer-camps/${id}/sessions/${sessionId}/resources/${editId}`
        : `/api/summer-camps/${id}/sessions/${sessionId}/resources`;
      const res = await fetch(url, {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      show(editId ? "Recurso actualizado" : "Recurso creado", "success");
      resetForm();
      load();
    } catch {
      show("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteResource(resourceId: string) {
    if (!confirm("¿Eliminar este recurso?")) return;
    try {
      await fetch(`/api/summer-camps/${id}/sessions/${sessionId}/resources/${resourceId}`, { method: "DELETE" });
      show("Recurso eliminado", "success");
      if (editId === resourceId) resetForm();
      load();
    } catch {
      show("Error", "error");
    }
  }

  function updateLink(i: number, field: "label" | "url", val: string) {
    setLinks((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-eyebrow mb-1">Summer Camp · Sesión · Recursos</p>
          <h1 className="font-heading text-3xl font-light">Recursos de la sesión</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/teacher/summer-camps/${id}`}>← Volver</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="playful-card px-6 py-6 space-y-4">
          <h2 className="font-heading text-lg font-medium">{editId ? "Editar recurso" : "Nuevo recurso"}</h2>

          <div className="space-y-1.5">
            <Label htmlFor="rtitle">Título *</Label>
            <Input id="rtitle" placeholder="Ej: Escala de Do mayor" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rcontent">Contenido (HTML)</Label>
            <textarea
              id="rcontent"
              rows={6}
              className="w-full rounded-lg border border-input bg-[var(--input-bg,var(--card))] px-3 py-2 font-body text-sm font-mono resize-y focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
              placeholder="<p>Notas sobre la escala…</p>"
              value={contentHtml}
              onChange={(e) => setContentHtml(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Links</Label>
            {links.map((l, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <Input placeholder="Etiqueta" value={l.label} onChange={(e) => updateLink(i, "label", e.target.value)} />
                <Input placeholder="https://…" value={l.url} onChange={(e) => updateLink(i, "url", e.target.value)} />
              </div>
            ))}
            <Button
              type="button" variant="outline" size="sm"
              onClick={() => setLinks((p) => [...p, { label: "", url: "" }])}
            >
              + Añadir link
            </Button>
          </div>

          <div className="flex gap-2 pt-1">
            <Button className="flex-1" onClick={save} disabled={saving}>
              {saving ? <><Spinner /> Guardando…</> : editId ? "Actualizar" : "Crear recurso"}
            </Button>
            {editId && <Button variant="outline" onClick={resetForm}>Cancelar edición</Button>}
          </div>
        </div>

        {/* Lista de recursos */}
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-medium">Recursos ({resources.length})</h2>
          {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> Cargando…</div>}
          {!loading && resources.length === 0 && (
            <div className="playful-card px-5 py-8 text-center text-muted-foreground font-body text-sm">
              Sin recursos todavía.
            </div>
          )}
          {resources.map((r) => (
            <div key={r.id} className={`playful-card px-4 py-3 space-y-2 ${editId === r.id ? "ring-2 ring-primary/40" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-body font-medium text-sm">{r.title}</p>
                <div className="flex gap-1.5 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => startEdit(r)}>Editar</Button>
                  <Button
                    variant="outline" size="sm"
                    className="text-destructive hover:border-destructive/40"
                    onClick={() => deleteResource(r.id)}
                  >
                    ×
                  </Button>
                </div>
              </div>
              {r.links && r.links.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {r.links.map((l, i) => (
                    <a
                      key={i} href={l.url} target="_blank" rel="noreferrer"
                      className="text-xs font-body text-primary hover:underline bg-primary/8 px-2 py-0.5 rounded-full"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
