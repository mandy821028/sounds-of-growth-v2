"use client";
import { useState } from "react";

export default function ToggleEnabled({ id, enabled }: { id: string; enabled: boolean }) {
  const [on, setOn] = useState(enabled);
  return (
    <button
      className={`text-sm border rounded px-2 py-1 ${on ? "border-green-400 bg-green-500/10" : "border-default hover:bg-primary/10"}`}
      onClick={async ()=>{
        const res = await fetch(`/api/social-links/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: !on }) });
        if (res.ok) setOn(!on);
      }}
    >
      {on ? "Enabled" : "Enable"}
    </button>
  );
}

