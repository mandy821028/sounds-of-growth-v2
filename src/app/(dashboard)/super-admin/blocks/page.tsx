"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Block = {
  id: string;
  type: string;
  path: string;
  locale: string;
  position: number;
  published: boolean;
};

export default function BlocksListPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<"en"|"es">(() => (typeof document !== "undefined" && document.cookie.includes("locale=es")) ? "es" : "en");
  const [dragId, setDragId] = useState<string|null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/page-blocks?locale=${locale}&path=/`, { cache: "no-store" });
    if (res.ok) setBlocks(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [locale]);

  async function togglePublish(id: string, published: boolean) {
    await fetch(`/api/page-blocks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !published }) });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this block?")) return;
    await fetch(`/api/page-blocks/${id}`, { method: "DELETE" });
    load();
  }

  function onDragStart(e: React.DragEvent, id: string) {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }
  function onDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;
    const srcIdx = blocks.findIndex(b => b.id === dragId);
    const tgtIdx = blocks.findIndex(b => b.id === targetId);
    if (srcIdx < 0 || tgtIdx < 0) return;
    const newOrder = [...blocks];
    const [moved] = newOrder.splice(srcIdx, 1);
    newOrder.splice(tgtIdx, 0, moved);
    // Recompute positions
    const updates = newOrder.map((b, i) => ({ ...b, position: i }));
    setBlocks(updates);
    setDragId(null);
  }
  async function persistOrder() {
    const updates = blocks.map((b, i) => ({ id: b.id, position: i }));
    await fetch("/api/page-blocks/reorder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updates }) });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Homepage Blocks</h1>
        <div className="flex items-center gap-2">
          <select className="border border-default rounded px-2 py-1 bg-card" value={locale} onChange={(e)=>setLocale(e.target.value as any)}>
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
          <Link href="/super-admin/blocks/new"><Button variant="outline">+ New</Button></Link>
          <button className="border border-default rounded px-2 py-1 text-sm hover:bg-primary/10" onClick={persistOrder}>Save order</button>
        </div>
      </div>
      {loading ? <div>Loading…</div> : (
        <ul className="space-y-2">
          {blocks.map(b => (
            <li
              key={b.id}
              className="border border-default rounded p-3 bg-card flex items-center justify-between"
              draggable
              onDragStart={(e)=>onDragStart(e, b.id)}
              onDragOver={onDragOver}
              onDrop={(e)=>onDrop(e, b.id)}
            >
              <div className="text-sm">
                <div className="font-medium">{b.type} · <span className="text-muted-foreground">{b.locale}</span> · <span className="text-muted-foreground">{b.path}</span></div>
                <div className="text-xs text-muted-foreground">Position {b.position}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={()=>togglePublish(b.id, b.published)}>{b.published ? "Unpublish" : "Publish"}</Button>
                <Link href={`/super-admin/blocks/${b.id}/edit`} className="border border-default rounded px-2 py-1 text-sm hover:bg-primary/10">Edit</Link>
                <button className="border border-default rounded px-2 py-1 text-sm hover:bg-primary/10" onClick={()=>remove(b.id)}>Delete</button>
              </div>
            </li>
          ))}
          {blocks.length===0 && <li className="text-sm text-muted-foreground">No blocks</li>}
        </ul>
      )}
    </div>
  );
}

