import React from "react";

type Step = { id: string; title: string; href?: string; done?: boolean };

export default function LearningPathRow({ heading, steps }: { heading?: string; steps: Step[] }) {
  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      {heading && <h3 className="text-xl font-semibold mb-4">{heading}</h3>}
      <div className="relative overflow-x-auto">
        <div className="flex items-center gap-6">
          {steps.map((s, i) => (
            <div key={s.id} className="relative">
              <a
                href={s.href || "#"}
                className="block border border-default rounded-lg bg-card px-4 py-3 hover:bg-primary/10 hover-lift animate-fade-up"
              >
                <div className="text-sm font-medium">{s.title}</div>
              </a>
              {i < steps.length - 1 && (
                <svg className="absolute left-full top-1/2 -translate-y-1/2 mx-2" width="60" height="24" viewBox="0 0 60 24" aria-hidden="true">
                  <path d="M0 12 C 15 0, 45 24, 60 12" stroke="#0097b2" strokeWidth="2" fill="none" className="transition-opacity opacity-70 group-hover:opacity-100" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

