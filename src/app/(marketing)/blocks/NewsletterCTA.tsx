"use client";
"use client";
import React, { useState } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { track } from "@/lib/track";

export default function NewsletterCTA({
  heading,
  sub,
  placeholder = "your@email.com",
  button = "Subscribe",
  whatsappLabel,
  whatsappHref,
}: {
  heading?: string;
  sub?: string;
  placeholder?: string;
  button?: string;
  whatsappLabel?: string;
  whatsappHref?: string;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { show } = useToast();

  async function submit() {
    setErr(null);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale: (document?.cookie||"").includes("locale=es") ? "es" : "en" }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      show("Subscribed!", "success");
      track("SUBSCRIBE", "NEWSLETTER", { email });
    } catch {
      setErr("Error");
      show("Subscription failed", "error");
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <div className="border border-default rounded-xl bg-card p-6">
        {heading && <h3 className="text-xl font-semibold mb-1">{heading}</h3>}
        {sub && <p className="text-sm text-muted-foreground mb-4">{sub}</p>}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="flex-1 border border-default rounded px-3 py-2 bg-card"
            placeholder={placeholder}
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            type="email"
          />
          <button className="border border-default rounded px-3 py-2 hover:bg-primary/10" onClick={submit} disabled={sent}>
            {sent ? "✓" : button}
          </button>
          {whatsappHref && (
            <a className="border border-default rounded px-3 py-2 hover:bg-primary/10" href={whatsappHref} target="_blank" rel="noreferrer">
              {whatsappLabel || "WhatsApp"}
            </a>
          )}
        </div>
        {err && <div className="text-sm text-red-500 mt-2">{err}</div>}
      </div>
    </section>
  );
}

