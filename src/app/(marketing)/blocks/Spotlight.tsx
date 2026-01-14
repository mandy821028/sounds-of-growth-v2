import React from "react";
import Link from "next/link";
import { track } from "@/lib/track";

export default function Spotlight({
  title,
  description,
  imageUrl,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description?: string;
  imageUrl?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-4 items-center border border-default rounded-xl bg-card overflow-hidden animate-fade-up">
        {imageUrl && (
          <div className="md:col-span-1">
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 md:col-span-2">
          <h3 className="text-2xl font-semibold mb-2">{title}</h3>
          {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
          {ctaHref && (
            <Link href={ctaHref} className="inline-block border border-default rounded px-3 py-2 hover:bg-primary/10 hover-lift" onClick={()=>track("CLICK","SPOTLIGHT",{title})}>
              {ctaLabel || "Learn more"}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

