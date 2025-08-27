"use client";
import { useEffect, useState } from "react";

export default function CancelRequestsPage() {
  const [reqs, setReqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/lessons/cancel-requests`, { cache: "no-store" });
        if (res.ok) setReqs(await res.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function act(id: string, action: "APPROVE"|"REJECT") {
    await fetch(`/api/lessons/cancel-requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    const res = await fetch(`/api/lessons/cancel-requests`, { cache: "no-store" });
    if (res.ok) setReqs(await res.json());
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Cancellation requests</h1>
      {loading ? <div>...</div> : (
        <ul className="space-y-2">
          {reqs.map((r) => (
            <li key={r.id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-medium flex items-center gap-2">
                  <img src={r.lesson?.student?.user?.image ?? "/avatar-placeholder.svg"} alt="avatar" className="w-6 h-6 rounded-full border object-cover" />
                  <span>{r.lesson?.student?.user?.firstName} {r.lesson?.student?.user?.lastName}</span>
                </div>
                <div className="text-sm text-gray-600">{new Date(r.requestedDateUtc).toLocaleString()} · {r.reason || ''} · {r.status}</div>
              </div>
              <div className="flex gap-2">
                {r.status === 'PENDING' ? (
                  <>
                    <button className="border px-2 py-1 rounded" onClick={() => act(r.id, 'APPROVE')}>Approve</button>
                    <button className="border px-2 py-1 rounded" onClick={() => act(r.id, 'REJECT')}>Reject</button>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">{r.status}</span>
                )}
              </div>
            </li>
          ))}
          {reqs.length === 0 && <li className="text-sm text-gray-600">No requests</li>}
        </ul>
      )}
    </div>
  );
}


