"use client";

export default function DeleteMediaButton({ name, label = "Delete" }: { name: string; label?: string }) {
  return (
    <button
      className="text-xs border border-default rounded px-2 py-1 hover:bg-red-500/10 self-start"
      onClick={async ()=>{
        if (!confirm(`${label}?`)) return;
        const res = await fetch(`/api/media/${encodeURIComponent(name)}`, { method: "DELETE" });
        if (res.ok) location.reload();
        else alert("Delete failed");
      }}
    >
      {label}
    </button>
  );
}

