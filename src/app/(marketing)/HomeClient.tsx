"use client";
import React, { useEffect, useMemo, useState } from "react";
import { renderBlock } from "./blocks/Renderer";
import { PageBlockType } from "@prisma/client";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HomeSlider, { type HomeSlide, type SliderRuntimeConfig } from "./HomeSlider.client";

type Block = { type: PageBlockType; data: unknown; audiences?: string[] | null; id?: string };
const AUDIENCES = ["ALL", "PARENTS", "STUDENTS", "TEACHERS"] as const;

export default function HomeClient({
  blocks,
  sliderItems,
  sliderConfig,
}: {
  blocks: Block[];
  sliderItems?: HomeSlide[];
  sliderConfig?: SliderRuntimeConfig;
}) {
  const fallbackSections = useMemo(
    () => ({
      aboutTitle: "Music education with a method",
      aboutBody:
        "We help children build confidence and musicality through structured lessons, guided materials, and consistent feedback.",
      servicesTitle: "Our services",
      servicesBody:
        "Choose the learning path that fits your goals. Clear milestones, fun practice, and real progress.",
      service1Title: "1:1 lessons",
      service1Body: "Personalized classes tailored to each student’s rhythm and interests.",
      service2Title: "Guided practice",
      service2Body: "Materials and weekly goals to keep progress steady between lessons.",
      service3Title: "Progress tracking",
      service3Body: "Simple reports and feedback so families can see growth over time.",
      contactTitle: "Contact us",
      contactBody: "Tell us about your goals and we’ll recommend the best next step.",
      contactCta: "Send us an email",
    }),
    []
  );

  let t: (key: string) => string = (key) => (fallbackSections as any)[key] ?? key;
  try {
    t = useTranslations("marketingSections");
  } catch {}

  const fallbackCommon = useMemo(() => ({ login: "Login" }), []);
  let tc: (key: string) => string = (key) => (fallbackCommon as any)[key] ?? key;
  try {
    tc = useTranslations("common");
  } catch {}

  const [aud, setAud] = useState<typeof AUDIENCES[number]>(() => {
    if (typeof document === "undefined") return "ALL";
    const m = document.cookie.match(/(?:^|; )aud=([^;]+)/);
    const v = (m?.[1] as any) as typeof AUDIENCES[number];
    return AUDIENCES.includes(v) ? v : "ALL";
  });
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.cookie = `aud=${aud}; path=/`;
    }
  }, [aud]);
  const filtered = useMemo(() => {
    if (aud === "ALL") return blocks;
    // Mostrar sólo bloques específicamente curados para esa audiencia
    return blocks.filter((b) => Array.isArray(b.audiences) && b.audiences.includes(aud));
  }, [blocks, aud]);
  return (
    <div>
      {Array.isArray(sliderItems) && sliderItems.length > 0 && <HomeSlider items={sliderItems} config={sliderConfig} />}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <div className="inline-flex rounded-full border border-default bg-secondary p-1">
          {AUDIENCES.map((a) => (
            <button key={a} className={`px-3 py-1 text-sm rounded-full ${aud===a?'bg-primary text-black':'text-muted'}`} onClick={()=>setAud(a)}>{a}</button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="max-w-5xl mx-auto px-4 py-10 text-sm text-muted-foreground">
          {aud === "ALL"
            ? "No content yet."
            : `No curated content for ${aud.toLowerCase()} yet.`}
        </div>
      ) : (
        filtered.map((b, i) => (
          <section key={i}>{renderBlock(b)}</section>
        ))
      )}

      {/* Minimal public sections for header anchors */}
      <section id="about" className="scroll-mt-28">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="relative overflow-hidden rounded-2xl border border-default bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 p-8 md:p-10">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" aria-hidden="true" />
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{t("aboutTitle")}</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">{t("aboutBody")}</p>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-28">
        <div className="max-w-5xl mx-auto px-4 pb-16">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{t("servicesTitle")}</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">{t("servicesBody")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
              <CardHeader>
                <CardTitle className="text-base">{t("service1Title")}</CardTitle>
                <CardDescription>{t("service1Body")}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
            <Card className="bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
              <CardHeader>
                <CardTitle className="text-base">{t("service2Title")}</CardTitle>
                <CardDescription>{t("service2Body")}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
            <Card className="bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
              <CardHeader>
                <CardTitle className="text-base">{t("service3Title")}</CardTitle>
                <CardDescription>{t("service3Body")}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-28">
        <div className="max-w-5xl mx-auto px-4 pb-20">
          <div className="relative overflow-hidden rounded-2xl border border-default bg-gradient-to-b from-[rgba(0,151,178,0.10)] to-transparent p-8 md:p-10">
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" aria-hidden="true" />
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{t("contactTitle")}</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">{t("contactBody")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <a href="mailto:admin@soundsofgrowth.com">{t("contactCta")}</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/login">{tc("login")}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

