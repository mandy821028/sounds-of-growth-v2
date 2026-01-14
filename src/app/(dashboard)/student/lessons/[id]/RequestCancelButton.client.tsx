"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/ui/toast-provider';

export default function RequestCancelButton({ lessonId, occurrenceIso }: { lessonId: string; occurrenceIso: string }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('studentLessons');
  const tCommon = useTranslations('common');
  const { show } = useToast();
  return (
    <button className="border px-3 py-2 rounded disabled:opacity-50" disabled={sent || loading} onClick={async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/lessons/${lessonId}/cancel-requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestedDateUtc: occurrenceIso }) });
        if (!res.ok) throw new Error();
        setSent(true);
        show(tCommon('success'), 'success');
      } catch {
        show(tCommon('error'), 'error');
      } finally {
        setLoading(false);
      }
    }}>{sent ? t('requestSent') : (loading ? '...' : t('cancelRequest'))}</button>
  );
}


