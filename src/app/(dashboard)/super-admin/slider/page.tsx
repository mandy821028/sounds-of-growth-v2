import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import ToggleSlideEnabled from "./toggle-enabled.client";
import DeleteSlideButton from "./delete-slide.client";
import SliderSettings from "./slider-settings.client";

export const dynamic = "force-dynamic";

export default async function SliderListPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";
  const t = {
    title: locale === "es" ? "Slider" : "Slider",
    new: locale === "es" ? "+ Nuevo" : "+ New",
    empty: locale === "es" ? "No hay slides todavía." : "No slides yet.",
    edit: locale === "es" ? "Editar" : "Edit",
    order: locale === "es" ? "Orden" : "Order",
    settingsTitle: locale === "es" ? "Configuración" : "Settings",
    intervalMs: locale === "es" ? "Tiempo entre slides (ms)" : "Time between slides (ms)",
    transition: locale === "es" ? "Transición" : "Transition",
    textAnimation: locale === "es" ? "Animación del texto" : "Text animation",
    save: locale === "es" ? "Guardar" : "Save",
    saving: locale === "es" ? "Guardando..." : "Saving...",
    hint:
      locale === "es"
        ? "Afecta el slider del Home (según el idioma actual)."
        : "Affects the Home slider (for the current language).",
    fade: locale === "es" ? "Fade" : "Fade",
    slide: locale === "es" ? "Slide" : "Slide",
    none: locale === "es" ? "Ninguna" : "None",
    fadeUp: locale === "es" ? "Fade + Up" : "Fade + Up",
  };

  const cfg = await prisma.sliderConfig.findUnique({ where: { locale } }).catch(() => null);

  const items = await prisma.sliderItem.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{t.title}</h1>
        <Link href="/super-admin/slider/new" className="border border-default rounded px-3 py-1 hover:bg-primary/10">
          {t.new}
        </Link>
      </div>

      <SliderSettings
        locale={locale}
        initial={{
          intervalMs: cfg?.intervalMs ?? 6500,
          transition: cfg?.transition === "slide" ? "slide" : "fade",
          textAnimation: cfg?.textAnimation === "none" ? "none" : cfg?.textAnimation === "fade" ? "fade" : "fade-up",
        }}
        labels={{
          title: t.settingsTitle,
          intervalMs: t.intervalMs,
          transition: t.transition,
          textAnimation: t.textAnimation,
          save: t.save,
          saving: t.saving,
          hint: t.hint,
          fade: t.fade,
          slide: t.slide,
          none: t.none,
          fadeUp: t.fadeUp,
        }}
      />

      <div className="space-y-3 mt-4">
        {items.map((s) => (
          <div key={s.id} className="flex items-center justify-between border border-default rounded-lg bg-card px-3 py-2">
            <div className="min-w-0 flex items-center gap-3">
              {s.imageUrl ? (
                <img src={s.imageUrl} alt="" className="w-16 h-10 rounded border object-cover" />
              ) : (
                <div className="w-16 h-10 rounded border border-dashed flex items-center justify-center text-[10px] text-muted-foreground">
                  no image
                </div>
              )}
              <div className="min-w-0">
                <div className="font-medium truncate">{s.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {t.order}: {s.order} · {s.locale} · {s.buttonHref ? s.buttonHref : "—"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ToggleSlideEnabled id={s.id} enabled={s.enabled} />
              <Link href={`/super-admin/slider/${s.id}/edit`} className="text-sm border border-default rounded px-2 py-1 hover:bg-primary/10">
                {t.edit}
              </Link>
              <DeleteSlideButton id={s.id} />
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-muted-foreground">{t.empty}</div>}
      </div>
    </div>
  );
}

