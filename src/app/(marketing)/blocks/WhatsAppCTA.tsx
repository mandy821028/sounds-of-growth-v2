"use client";
import React from "react";

export default function WhatsAppCTA({
  heading,
  sub,
  number,
  message,
  button = "WhatsApp",
}: {
  heading?: string;
  sub?: string;
  number?: string;
  message?: string;
  button?: string;
}) {
  const envNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const finalNumber = (number || envNumber || "").replace(/[^\d]/g, "");
  const finalMsg = encodeURIComponent(message || "");
  const href = finalNumber ? `https://wa.me/${finalNumber}${finalMsg ? `?text=${finalMsg}` : ""}` : undefined;
  function onClick() {
    try {
      const meta = { number: finalNumber };
      if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
        const blob = new Blob([JSON.stringify({ action: "CLICK", block: "WHATSAPP", meta })], { type: "application/json" });
        (navigator as any).sendBeacon("/api/analytics/track?path=" + encodeURIComponent(location.pathname), blob);
      }
    } catch {}
  }
  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <div className="border border-default rounded-xl bg-card p-6 flex items-center justify-between gap-4">
        <div>
          {heading && <h3 className="text-xl font-semibold mb-1">{heading}</h3>}
          {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
        </div>
        <a
          className={`border border-default rounded px-3 py-2 ${href ? "hover:bg-primary/10" : "opacity-50 pointer-events-none"}`}
          href={href}
          target="_blank"
          rel="noreferrer"
          onClick={onClick}
        >
          {button}
        </a>
      </div>
    </section>
  );
}

