"use client";
import { useMemo, useState } from "react";
import MediaPicker from "./media-picker.client";
import type { SliderItem } from "@prisma/client";

type Slide = SliderItem;

export default function SlideForm({
  mode,
  slide,
}: {
  mode: "new" | "edit";
  slide?: Slide;
}) {
  const isEdit = mode === "edit";
  const initial = useMemo<Slide>(
    () =>
      slide ?? {
        id: "",
        locale: "en",
        title: "",
        subtitle: null,
        imageUrl: "",
        buttonLabel: null,
        buttonHref: null,
        buttonTarget: "_self",
        order: 0,
        enabled: true,
      },
    [slide]
  );

  const [locale, setLocale] = useState<"en" | "es">(initial.locale);
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle || "");
  const [imageUrl, setImageUrl] = useState(initial.imageUrl || "");
  const [buttonLabel, setButtonLabel] = useState(initial.buttonLabel || "");
  const [buttonHref, setButtonHref] = useState(initial.buttonHref || "");
  const [buttonTarget, setButtonTarget] = useState<"_self" | "_blank">(initial.buttonTarget || "_self");
  const [order, setOrder] = useState<number>(initial.order || 0);
  const [enabled, setEnabled] = useState<boolean>(initial.enabled ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function save() {
    setLoading(true);
    setError(undefined);
    try {
      const payload = {
        locale,
        title,
        subtitle,
        imageUrl,
        buttonLabel: buttonLabel || null,
        buttonHref: buttonHref || null,
        buttonTarget,
        order,
        enabled,
      };
      const res = await fetch(isEdit ? `/api/slider-items/${initial.id}` : "/api/slider-items", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        const msg = j?.error || "Error saving";
        throw new Error(msg);
      }
      location.href = "/super-admin/slider";
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error saving";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{isEdit ? "Edit Slide" : "New Slide"}</h1>
      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm">
          Locale
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value === "es" ? "es" : "en")}
            className="block mt-1 border border-default rounded px-2 py-1 bg-card"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
        </label>

        <label className="text-sm">
          Order
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className="block w-full mt-1 border border-default rounded px-2 py-1 bg-card"
          />
        </label>

        <label className="text-sm md:col-span-2">
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="block w-full mt-1 border border-default rounded px-2 py-1 bg-card" required />
        </label>

        <label className="text-sm md:col-span-2">
          Subtitle
          <textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={3} className="block w-full mt-1 border border-default rounded px-2 py-1 bg-card" />
        </label>

        <label className="text-sm md:col-span-2">
          Background image URL
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="block w-full mt-1 border border-default rounded px-2 py-1 bg-card"
            placeholder="/assets/your-image.jpg"
            required
          />
          <div className="mt-2">
            <MediaPicker value={imageUrl} onChange={setImageUrl} />
          </div>
          {imageUrl && (
            <div className="mt-3 border border-default rounded-lg overflow-hidden">
              <img src={imageUrl} alt="" className="w-full max-h-56 object-cover" />
            </div>
          )}
        </label>

        <label className="text-sm">
          Button label
          <input value={buttonLabel} onChange={(e) => setButtonLabel(e.target.value)} className="block w-full mt-1 border border-default rounded px-2 py-1 bg-card" placeholder="Get started" />
        </label>

        <label className="text-sm">
          Button link (URL)
          <input value={buttonHref} onChange={(e) => setButtonHref(e.target.value)} className="block w-full mt-1 border border-default rounded px-2 py-1 bg-card" placeholder="https://..." />
        </label>

        <label className="text-sm">
          Button target
          <select
            value={buttonTarget}
            onChange={(e) => setButtonTarget(e.target.value === "_blank" ? "_blank" : "_self")}
            className="block mt-1 border border-default rounded px-2 py-1 bg-card"
          >
            <option value="_self">Same tab (_self)</option>
            <option value="_blank">New tab (_blank)</option>
          </select>
        </label>

        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> Enabled
        </label>
      </div>

      <div className="flex gap-2">
        <button className="border border-default rounded px-3 py-1 hover:bg-primary/10" onClick={save} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={() => history.back()} className="border border-default rounded px-3 py-1">
          Cancel
        </button>
      </div>
    </div>
  );
}

