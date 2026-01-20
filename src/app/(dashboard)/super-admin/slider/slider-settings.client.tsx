"use client";
import { useMemo, useState } from "react";

type Transition = "fade" | "slide";
type TextAnimation = "none" | "fade" | "fade-up";

export default function SliderSettings({
  locale,
  initial,
  labels,
}: {
  locale: "en" | "es";
  initial: { intervalMs: number; transition: Transition; textAnimation: TextAnimation };
  labels: {
    title: string;
    intervalMs: string;
    transition: string;
    textAnimation: string;
    save: string;
    saving: string;
    hint: string;
    fade: string;
    slide: string;
    none: string;
    fadeUp: string;
  };
}) {
  const [intervalMs, setIntervalMs] = useState<number>(initial.intervalMs ?? 6500);
  const [transition, setTransition] = useState<Transition>(initial.transition ?? "fade");
  const [textAnimation, setTextAnimation] = useState<TextAnimation>(initial.textAnimation ?? "fade-up");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeInterval = useMemo(() => {
    const n = Number(intervalMs);
    if (!Number.isFinite(n)) return 6500;
    return Math.max(1500, Math.min(20000, Math.round(n)));
  }, [intervalMs]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/slider-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, intervalMs: safeInterval, transition, textAnimation }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || "Error saving");
      }
      location.reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error saving");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-default rounded-lg bg-card p-3 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium">{labels.title}</div>
          <div className="text-xs text-muted-foreground">{labels.hint}</div>
        </div>
        <button
          type="button"
          className="border border-default rounded px-3 py-1 hover:bg-primary/10"
          onClick={save}
          disabled={saving}
        >
          {saving ? labels.saving : labels.save}
        </button>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="text-sm">
          {labels.intervalMs}
          <input
            type="number"
            value={intervalMs}
            onChange={(e) => setIntervalMs(Number(e.target.value))}
            className="block w-full mt-1 border border-default rounded px-2 py-1 bg-background"
            min={1500}
            max={20000}
            step={100}
          />
        </label>

        <label className="text-sm">
          {labels.transition}
          <select
            value={transition}
            onChange={(e) => setTransition(e.target.value === "slide" ? "slide" : "fade")}
            className="block w-full mt-1 border border-default rounded px-2 py-1 bg-background"
          >
            <option value="fade">{labels.fade}</option>
            <option value="slide">{labels.slide}</option>
          </select>
        </label>

        <label className="text-sm">
          {labels.textAnimation}
          <select
            value={textAnimation}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "none") return setTextAnimation("none");
              if (v === "fade") return setTextAnimation("fade");
              return setTextAnimation("fade-up");
            }}
            className="block w-full mt-1 border border-default rounded px-2 py-1 bg-background"
          >
            <option value="fade-up">{labels.fadeUp}</option>
            <option value="fade">{labels.fade}</option>
            <option value="none">{labels.none}</option>
          </select>
        </label>
      </div>
    </div>
  );
}

