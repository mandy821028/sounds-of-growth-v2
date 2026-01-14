import React from "react";

export default function Hero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="relative py-16">
      {/* Curved pentagram background */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full -z-10 opacity-20 animate-float-slow">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0097b2" stopOpacity="0.15" />
            <stop offset="1" stopColor="#0097b2" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {Array.from({ length: 5 }).map((_, i) => (
          <path
            key={i}
            d={`M -10 ${40 + i * 40} C 180 20, 360 ${80 + i * 20}, 640 ${30 + i * 45} S 1100 ${120 + i * 35}, 1400 ${50 + i * 50}`}
            fill="none"
            stroke="url(#g)"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 animate-fade-in">{title}</h1>
        {subtitle && <p className="text-lg text-muted-foreground max-w-2xl animate-fade-up">{subtitle}</p>}
      </div>
    </section>
  );
}

