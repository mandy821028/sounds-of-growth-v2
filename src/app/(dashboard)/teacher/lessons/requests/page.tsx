"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/toast-provider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function CancelRequestsPage() {
  const [reqs, setReqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const tTeacher = useTranslations("teacherLessons");
  const tCommon = useTranslations("common");
  const { show } = useToast();
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
    try {
      const r = await fetch(`/api/lessons/cancel-requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
      if (!r.ok) throw new Error();
      const res = await fetch(`/api/lessons/cancel-requests`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      setReqs(await res.json());
      show(tCommon("success"), "success");
    } catch {
      show(tCommon("error"), "error");
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">{tTeacher("cancellations")}</h1>
      {loading ? <div className="inline-flex items-center gap-2"><Spinner /> {tCommon("loading")}</div> : (
        <ul className="space-y-2">
          {reqs.map((r) => (
            <li key={r.id} className="border border-default rounded p-3 bg-card flex items-center justify-between">
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
                    <Button variant="outline" size="sm" onClick={() => act(r.id, 'APPROVE')}>{tTeacher("approve")}</Button>
                    <Button variant="outline" size="sm" onClick={() => act(r.id, 'REJECT')}>{tTeacher("reject")}</Button>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">{r.status}</span>
                )}
              </div>
            </li>
          ))}
          {reqs.length === 0 && <li className="text-sm text-gray-600">{tTeacher("noRequests")}</li>}
        </ul>
      )}
    </div>
  );
}


