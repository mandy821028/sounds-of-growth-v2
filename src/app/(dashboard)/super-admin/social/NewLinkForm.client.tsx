"use client";
import { useState } from "react";

export default function NewLinkForm({ providers }: { providers: string[] }) {
  const [provider, setProvider] = useState(providers[0] || "INSTAGRAM");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  async function add() {
    if (!label.trim() || !url.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/social-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, label, url, iconUrl, order }),
      });
      if (!res.ok) throw new Error();
      location.reload();
    } catch {
      alert("Error creating link");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="border border-default rounded bg-card p-3 grid grid-cols-1 md:grid-cols-5 gap-2">
      <label className="text-sm">
        Provider
        <select value={provider} onChange={(e)=>setProvider(e.target.value)} className="block w-full mt-1 border rounded px-2 py-1 bg-background">
          {providers.map((p)=>(<option key={p} value={p}>{p}</option>))}
        </select>
      </label>
      <label className="text-sm">
        Label
        <input value={label} onChange={(e)=>setLabel(e.target.value)} className="block w-full mt-1 border rounded px-2 py-1 bg-background" />
      </label>
      <label className="text-sm md:col-span-2">
        URL
        <input value={url} onChange={(e)=>setUrl(e.target.value)} className="block w-full mt-1 border rounded px-2 py-1 bg-background" placeholder="https://..." />
      </label>
      <label className="text-sm md:col-span-2">
        Icon URL
        <input value={iconUrl} onChange={(e)=>setIconUrl(e.target.value)} className="block w-full mt-1 border rounded px-2 py-1 bg-background" placeholder="/assets/your-icon.svg" />
      </label>
      <label className="text-sm">
        Order
        <input type="number" value={order} onChange={(e)=>setOrder(Number(e.target.value))} className="block w-full mt-1 border rounded px-2 py-1 bg-background" />
      </label>
      <div className="md:col-span-5">
        <button className="border border-default rounded px-3 py-1 hover:bg-primary/10" onClick={add} disabled={saving}>
          {saving ? "Adding..." : "+ Add"}
        </button>
      </div>
    </div>
  );
}

