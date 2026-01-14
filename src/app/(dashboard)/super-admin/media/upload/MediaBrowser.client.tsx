"use client";
import { useMemo, useState } from "react";
import DeleteMediaButton from "./DeleteMediaButton.client";

type Item = { name: string; url: string; size: number; mtime: string };
function isImage(name: string) {
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(name);
}
function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export default function MediaBrowser({
  items,
  labels,
}: {
  items: Item[];
  labels: { files: string; delete: string; grid: string; list: string; empty: string };
}) {
  const [mode, setMode] = useState<"grid" | "list">("grid");
  const sorted = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm text-muted-foreground">{labels.files}</h2>
        <div className="flex items-center gap-2">
          <button
            className={`text-xs border rounded px-2 py-1 ${mode === "grid" ? "bg-primary/10 border-primary" : "border-default"}`}
            onClick={() => setMode("grid")}
          >
            {labels.grid}
          </button>
          <button
            className={`text-xs border rounded px-2 py-1 ${mode === "list" ? "bg-primary/10 border-primary" : "border-default"}`}
            onClick={() => setMode("list")}
          >
            {labels.list}
          </button>
        </div>
      </div>
      {sorted.length === 0 ? (
        <div className="text-sm text-muted-foreground">{labels.empty}</div>
      ) : mode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {sorted.map((f) => (
            <div key={f.name} className="border border-default rounded-lg bg-card p-2 flex flex-col gap-2">
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="block">
                {isImage(f.name) ? (
                  <img src={f.url} alt={f.name} className="w-full h-28 object-cover rounded" />
                ) : (
                  <div className="w-full h-28 rounded border border-dashed flex items-center justify-center text-xs text-muted-foreground">
                    {f.name.split(".").pop()?.toUpperCase()} file
                  </div>
                )}
              </a>
              <div className="text-xs truncate">{f.name}</div>
              <div className="text-[11px] text-muted-foreground">{formatBytes(f.size)}</div>
              <DeleteMediaButton name={f.name} label={labels.delete} />
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-default rounded bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-secondary/40">
              <tr>
                <th className="text-left p-2">Preview</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Size</th>
                <th className="text-left p-2">Modified</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((f) => (
                <tr key={f.name} className="border-t border-default">
                  <td className="p-2">
                    <a href={f.url} target="_blank" rel="noopener noreferrer">
                      {isImage(f.name) ? (
                        <img src={f.url} alt={f.name} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 rounded border border-dashed flex items-center justify-center text-[10px] text-muted-foreground">
                          {f.name.split(".").pop()?.toUpperCase()}
                        </div>
                      )}
                    </a>
                  </td>
                  <td className="p-2 max-w-[280px] truncate">{f.name}</td>
                  <td className="p-2">{formatBytes(f.size)}</td>
                  <td className="p-2">{new Date(f.mtime).toLocaleString()}</td>
                  <td className="p-2">
                    <DeleteMediaButton name={f.name} label={labels.delete} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

