"use client";

export default function DeleteLink({ id }: { id: string }) {
  return (
    <button
      className="text-sm border border-default rounded px-2 py-1 hover:bg-red-500/10"
      onClick={async ()=>{
        if (!confirm("Delete link?")) return;
        await fetch(`/api/social-links/${id}`, { method: "DELETE" });
        location.reload();
      }}
    >
      Delete
    </button>
  );
}

