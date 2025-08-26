"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  function getLocale(): "en" | "es" {
    if (typeof document === "undefined") return "en";
    const m = document.cookie.match(/(?:^|; )locale=([^;]+)/);
    return m?.[1] === "es" ? "es" : "en";
  }
  const t = {
    title: getLocale() === "es" ? "Cambiar contraseña" : "Change password",
    current: getLocale() === "es" ? "Contraseña actual" : "Current password",
    next: getLocale() === "es" ? "Nueva contraseña" : "New password",
    save: getLocale() === "es" ? "Guardar" : "Save",
    updated: getLocale() === "es" ? "Contraseña actualizada" : "Password updated",
  };

  useEffect(() => {
    (async () => {
      try {
        const s = await fetch("/api/auth/session", { cache: "no-store" }).then((r) => r.json());
        if (!s?.user) router.replace("/login?callbackUrl=/account/change-password");
      } catch {
        router.replace("/login?callbackUrl=/account/change-password");
      }
    })();
  }, [router]);

  async function submit() {
    setError(null);
    const res = await fetch("/api/account/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.replace("/me"), 1000);
    } else {
      const txt = await res.text();
      setError(txt || "Error");
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-6">{t.title}</h1>
      <div className="space-y-3">
        <input className="w-full border rounded px-3 py-2" type="password" placeholder={t.current} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" type="password" placeholder={t.next} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button className="w-full bg-black text-white py-2 rounded" onClick={submit}>{t.save}</button>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{t.updated}</p>}
      </div>
    </div>
  );
}

