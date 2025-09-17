"use client";
import { useEffect, useState } from "react";

export default function AccountPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [locale, setLocale] = useState<"en" | "es">("en");
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lang, setLang] = useState<'en'|'es'>('en');

  function t(key: string) {
    const dict: Record<string, { en: string; es: string }> = {
      title: { en: "My profile", es: "Mi perfil" },
      first: { en: "First name", es: "Nombre" },
      last: { en: "Last name", es: "Apellido" },
      tel: { en: "Phone (optional)", es: "Teléfono (opcional)" },
      lang: { en: "Language", es: "Idioma" },
      save: { en: "Save", es: "Guardar" },
      saved: { en: "Saved", es: "Guardado" },
      photo: { en: "Profile photo", es: "Foto de perfil" },
      upload: { en: "Upload", es: "Subir" },
    };
    return dict[key][lang];
  }

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/account/profile", { cache: "no-store" });
      if (res.ok) {
        const u = await res.json();
        setFirstName(u.firstName ?? "");
        setLastName(u.lastName ?? "");
        setEmail(u.email ?? "");
        setPhone(u.phone ?? "");
        setLocale(u.locale === "es" ? "es" : "en");
        setImage(u.image ?? null);
      }
    })();
  }, []);

  useEffect(() => {
    try {
      const m = document.cookie.match(/(?:^|; )locale=([^;]+)/);
      setLang(m?.[1] === 'es' ? 'es' : 'en');
      const onLocale = () => {
        const mx = document.cookie.match(/(?:^|; )locale=([^;]+)/);
        setLang(mx?.[1] === 'es' ? 'es' : 'en');
      };
      window.addEventListener('locale-change', onLocale);
      return () => window.removeEventListener('locale-change', onLocale);
    } catch {}
  }, []);

  async function onSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, phone, locale }),
    });
    setSaving(false);
    if (res.ok) {
      document.cookie = `locale=${locale}; path=/`;
      window.dispatchEvent(new CustomEvent("locale-change", { detail: locale }));
      setSaved(true);
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">{t("title")}</h1>
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <img src={image ?? "/avatar-placeholder.svg"} alt="avatar" className="w-16 h-16 rounded-full border object-cover" />
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t("photo")}</label>
            <input type="file" accept="image/*" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const fd = new FormData();
              fd.append("file", f);
              setUploading(true);
              const res = await fetch("/api/account/profile/image", { method: "POST", body: fd });
              setUploading(false);
              if (res.ok) {
                const data = await res.json();
                setImage(data.url);
                try { window.dispatchEvent(new CustomEvent('avatar-change', { detail: data.url })); } catch {}
              }
            }} />
            {uploading && <div className="text-xs text-gray-500 mt-1">...</div>}
          </div>
        </div>
        <input className="w-full border rounded px-3 py-2" placeholder={t("first")} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder={t("last")} value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} readOnly />
        <input className="w-full border rounded px-3 py-2" placeholder={t("tel")} value={phone} onChange={(e) => setPhone(e.target.value)} />
        <select className="w-full border rounded px-3 py-2" value={locale} onChange={(e) => setLocale(e.target.value as any)}>
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
        <button className="w-full bg-black text-white py-2 rounded disabled:opacity-50" onClick={onSave} disabled={saving}>{saving ? "..." : t("save")}</button>
        {saved && <p className="text-sm text-green-600">{t("saved")}</p>}
      </div>
    </div>
  );
}


