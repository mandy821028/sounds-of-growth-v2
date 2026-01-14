"use client";

export async function track(action: string, block: string, meta?: any) {
  try {
    const url = typeof window !== "undefined" ? window.location.pathname : "/";
    const payload = JSON.stringify({ action, block, meta });
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([payload], { type: "application/json" });
      (navigator as any).sendBeacon(`/api/analytics/track?path=${encodeURIComponent(url)}`, blob);
      return;
    }
    await fetch(`/api/analytics/track?path=${encodeURIComponent(url)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  } catch {}
}

