"use client";
import { useEffect, useMemo, useState } from "react";

type MediaItem = { name: string; url: string; size: number; mtime: string | Date };

function isImage(name: string) {
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(name);
}

export default function MediaPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/media", { cache: "no-store" });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as MediaItem[];
        setItems(Array.isArray(data) ? data : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const imgs = items.filter((i) => isImage(i.name));
    if (!qq) return imgs;
    return imgs.filter((i) => i.name.toLowerCase().includes(qq));
  }, [items, q]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button type="button" className="text-sm border border-default rounded px-2 py-1 hover:bg-primary/10" onClick={() => setOpen(true)}>
          Browse media
        </button>
        {value && (
          <button type="button" className="text-sm border border-default rounded px-2 py-1 hover:bg-primary/10" onClick={() => onChange("")}>
            Clear
          </button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-1/2 top-1/2 w-[min(920px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-default bg-background/80 backdrop-blur shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-default">
              <div className="text-sm font-medium">Select an image</div>
              <button type="button" className="text-sm border border-default rounded px-2 py-1 hover:bg-primary/10" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <div className="p-4 space-y-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search files..."
                className="w-full border border-default rounded px-3 py-2 bg-card"
              />
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="text-sm text-muted-foreground">No images found.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[60vh] overflow-auto pr-1">
                  {filtered.map((f) => (
                    <button
                      type="button"
                      key={f.name}
                      className="text-left border border-default rounded-lg bg-card p-2 hover:bg-primary/10 transition"
                      onClick={() => {
                        onChange(f.url);
                        setOpen(false);
                      }}
                    >
                      <img src={f.url} alt={f.name} className="w-full h-24 object-cover rounded" />
                      <div className="mt-2 text-xs truncate">{f.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

