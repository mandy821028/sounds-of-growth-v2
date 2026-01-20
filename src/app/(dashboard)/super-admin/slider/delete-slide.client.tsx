"use client";

export default function DeleteSlideButton({ id }: { id: string }) {
  return (
    <button
      className="text-sm border border-default rounded px-2 py-1 hover:bg-red-500/10"
      onClick={async () => {
        if (!confirm("Delete slide?")) return;
        await fetch(`/api/slider-items/${id}`, { method: "DELETE" });
        location.reload();
      }}
    >
      Delete
    </button>
  );
}

