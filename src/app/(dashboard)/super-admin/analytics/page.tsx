"use client";
import { useEffect, useState } from "react";

type Row = { block: string; action: string; _count: { _all: number } };

export default function AnalyticsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/analytics/summary", { cache: "no-store" });
      if (res.ok) setRows(await res.json());
      setLoading(false);
    })();
  }, []);
  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold mb-4">Analytics</h1>
      {loading ? <div>Loading…</div> : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-2 pr-4">Block</th>
              <th className="py-2 pr-4">Action</th>
              <th className="py-2 pr-4">Count</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-default">
                <td className="py-2 pr-4">{r.block}</td>
                <td className="py-2 pr-4">{r.action}</td>
                <td className="py-2 pr-4">{r._count?._all ?? 0}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="py-3 text-muted-foreground" colSpan={3}>No data yet</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

