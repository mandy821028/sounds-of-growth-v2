"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-provider";

export default function ResendInviteButton({ studentId, email }: { studentId: string; email: string }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { show } = useToast();

  async function resend() {
    if (!confirm(`¿Reenviar el correo de invitación a ${email}?\n\nSe generará una nueva contraseña temporal.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${studentId}/resend-invite`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error");
      }
      setSent(true);
      show(`Invitación enviada a ${email}`, "success");
    } catch (e: any) {
      show(e.message ?? "Error al enviar el correo", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={resend}
      disabled={loading || sent}
      className={sent ? "text-green-600 border-green-300" : ""}
    >
      {loading ? <><Spinner /> Enviando…</> : sent ? "✓ Enviado" : "Reenviar invitación"}
    </Button>
  );
}
