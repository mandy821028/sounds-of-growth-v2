import React from "react";
import { track } from "@/lib/track";

type EventItem = { id: string; title: string; dateIso: string; location?: string; href?: string };

export default function Events({ heading, items }: { heading?: string; items: EventItem[] }) {
  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      {heading && <h3 className="text-xl font-semibold mb-4">{heading}</h3>}
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((e) => {
          const d = new Date(e.dateIso);
          const ds = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(d);
          return (
            <a
              key={e.id}
              href={e.href || "#"}
              className="border border-default rounded p-4 bg-card hover:bg-primary/10 hover-lift animate-fade-up"
              onClick={() => track("CLICK", "EVENTS", { id: e.id })}
            >
              <div className="text-sm text-muted-foreground">{ds}{e.location ? ` · ${e.location}` : ""}</div>
              <div className="font-medium">{e.title}</div>
            </a>
          );
        })}
        {items.length===0 && <div className="text-sm text-muted-foreground">—</div>}
      </div>
    </section>
  );
}

