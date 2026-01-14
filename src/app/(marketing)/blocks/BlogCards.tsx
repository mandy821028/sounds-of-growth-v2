import React from "react";
import Link from "next/link";
import { track } from "@/lib/track";

type BlogCard = {
  id: string;
  title: string;
  excerpt: string;
  href: string;
  tag?: string;
  date?: string;
  image?: string;
};

export default function BlogCards({ heading, items }: { heading?: string; items: BlogCard[] }) {
  return (
    <section className="max-w-5xl mx-auto px=4 px-4 py-8">
      {heading && <h3 className="text-xl font-semibold mb=4">{heading}</h3>}
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((it) => (
          <article key={it.id} className="border border-default rounded-lg bg-card overflow-hidden hover-lift animate-fade-up">
            {it.image && <img src={it.image} alt="" className="w-full h-36 object-cover" />}
            <div className="p-4">
              {it.tag && <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-foreground">{it.tag}</span>}
              <h4 className="mt-2 font-semibold">{it.title}</h4>
              {it.date && <div className="text-xs text-muted-foreground">{it.date}</div>}
              <p className="text-sm text-muted-foreground mt-2">{it.excerpt}</p>
              <Link href={it.href} className="inline-block mt-3 text-sm border border-default rounded px-2 py-1 hover:bg-primary/10"
                onClick={()=>track("CLICK","BLOG_CARD",{id: it.id, title: it.title})}
              >
                Read
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

