import React from "react";
import Link from "next/link";

export default function ChallengeOfWeek({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <section className="max-w-5xl mx-auto px-4">
      <div className="rounded-xl bg-primary/10 border border-default p-6 md:p-8">
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
        {ctaHref && (
          <Link href={ctaHref} className="inline-block border border-default rounded px-3 py-2 hover:bg-primary/20">
            {ctaLabel || "View"}
          </Link>
        )}
      </div>
    </section>
  );
}

