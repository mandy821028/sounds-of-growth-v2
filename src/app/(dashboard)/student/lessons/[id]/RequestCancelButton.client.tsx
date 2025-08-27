"use client";

import { useState } from 'react';

export default function RequestCancelButton({ lessonId, occurrenceIso, locale }: { lessonId: string; occurrenceIso: string; locale: 'en'|'es' }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const label = locale === 'es' ? 'Solicitar cancelación' : 'Request cancellation';
  const sentLabel = locale === 'es' ? 'Solicitud enviada' : 'Request sent';
  return (
    <button className="border px-3 py-2 rounded disabled:opacity-50" disabled={sent || loading} onClick={async () => {
      setLoading(true);
      const res = await fetch(`/api/lessons/${lessonId}/cancel-requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestedDateUtc: occurrenceIso }) });
      setLoading(false);
      if (res.ok) setSent(true);
    }}>{sent ? sentLabel : (loading ? '...' : label)}</button>
  );
}


