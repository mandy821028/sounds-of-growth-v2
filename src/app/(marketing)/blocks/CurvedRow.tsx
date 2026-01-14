import React from "react";

export default function CurvedRow({ children, heading }: { children: React.ReactNode; heading?: string }) {
  return (
    <section className="relative py-10">
      <div className="max-w-5xl mx-auto px-4">
        {heading && <h3 className="text-xl font-semibold mb-4">{heading}</h3>}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">{children}</div>
      </div>
      <svg aria-hidden="true" className="absolute inset-x-0 bottom-0 h-16 w-full -z-10 opacity-25">
        <path d="M0 10 C 200 40, 400 -10, 600 20 S 1000 30, 1200 5" stroke="#0097b2" strokeWidth="2" fill="none" />
      </svg>
    </section>
  );
}

