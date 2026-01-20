"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

export type HomeSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  buttonLabel: string | null;
  buttonHref: string | null;
  buttonTarget: "_self" | "_blank" | string;
};

export type SliderRuntimeConfig = {
  intervalMs?: number;
  transition?: "fade" | "slide";
  textAnimation?: "none" | "fade" | "fade-up";
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const onChange = () => setReduced(Boolean(mq.matches));
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

export default function HomeSlider({ items, config }: { items: HomeSlide[]; config?: SliderRuntimeConfig }) {
  const slides = useMemo(() => items.filter((s) => s?.imageUrl && s?.title), [items]);
  const reduced = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const intervalMs = Math.max(1500, Math.min(20000, Math.round(config?.intervalMs ?? 6500)));
  const transition = config?.transition === "slide" ? "slide" : "fade";
  const textAnimation = config?.textAnimation === "none" ? "none" : config?.textAnimation === "fade" ? "fade" : "fade-up";

  useEffect(() => {
    if (reduced) return;
    if (slides.length <= 1) return;
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(t);
  }, [slides.length, reduced, intervalMs]);

  useEffect(() => {
    if (idx >= slides.length) setIdx(0);
  }, [idx, slides.length]);

  if (slides.length === 0) return null;
  const active = slides[idx]!;

  return (
    <section className="relative">
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="relative overflow-hidden rounded-2xl border border-default bg-card/30">
          {/* Background */}
          <div className="absolute inset-0">
            {slides.map((s, i) => (
              <div
                key={s.id}
                className={cn(
                  "absolute inset-0 bg-center bg-cover will-change-transform",
                  reduced
                    ? "transition-none"
                    : transition === "slide"
                      ? "transition-[transform,opacity] duration-700 ease-out"
                      : "transition-opacity duration-700",
                  transition === "slide"
                    ? i === idx
                      ? "opacity-100 translate-x-0"
                      : i < idx
                        ? "opacity-0 -translate-x-6"
                        : "opacity-0 translate-x-6"
                    : i === idx
                      ? "opacity-100"
                      : "opacity-0"
                )}
                style={{ backgroundImage: `url(${s.imageUrl})` }}
                aria-hidden="true"
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/10" aria-hidden="true" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,151,178,0.20),transparent_55%)]" aria-hidden="true" />
          </div>

          {/* Content */}
          <div className="relative px-6 py-14 md:px-10 md:py-20">
            {/* key forces re-mount so text animations replay on slide change */}
            <div className="max-w-2xl" key={active.id}>
              <h1
                className={cn(
                  "text-3xl md:text-5xl font-semibold tracking-tight text-white drop-shadow",
                  reduced || textAnimation === "none"
                    ? ""
                    : textAnimation === "fade"
                      ? "animate-fade-in"
                      : "animate-fade-up"
                )}
                style={reduced || textAnimation === "none" ? undefined : ({ animationDelay: "0ms" } satisfies CSSProperties)}
              >
                {active.title}
              </h1>
              {active.subtitle && (
                <p
                  className={cn(
                    "mt-4 text-white/80 text-base md:text-lg leading-relaxed",
                    reduced || textAnimation === "none"
                      ? ""
                      : textAnimation === "fade"
                        ? "animate-fade-in"
                        : "animate-fade-up"
                  )}
                  style={reduced || textAnimation === "none" ? undefined : ({ animationDelay: "80ms" } satisfies CSSProperties)}
                >
                  {active.subtitle}
                </p>
              )}

              {active.buttonHref && active.buttonLabel && (
                <div
                  className={cn(
                    "mt-8",
                    reduced || textAnimation === "none"
                      ? ""
                      : textAnimation === "fade"
                        ? "animate-fade-in"
                        : "animate-fade-up"
                  )}
                  style={reduced || textAnimation === "none" ? undefined : ({ animationDelay: "160ms" } satisfies CSSProperties)}
                >
                  <Link
                    href={active.buttonHref}
                    target={active.buttonTarget === "_blank" ? "_blank" : "_self"}
                    rel={active.buttonTarget === "_blank" ? "noopener noreferrer" : undefined}
                    className={cn(
                      "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium transition",
                      // high contrast on any background image (minimal / glassy)
                      "bg-white/92 text-slate-900 shadow-sm ring-1 ring-white/25",
                      "hover:bg-white focus-visible:ring-2 focus-visible:ring-primary/70"
                    )}
                  >
                    {active.buttonLabel}
                  </Link>
                </div>
              )}
            </div>

            {/* Dots */}
            {slides.length > 1 && (
              <div className="mt-10 flex items-center gap-2">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setIdx(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full border transition",
                      i === idx ? "bg-primary border-primary" : "bg-white/15 border-white/25 hover:bg-white/25"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

