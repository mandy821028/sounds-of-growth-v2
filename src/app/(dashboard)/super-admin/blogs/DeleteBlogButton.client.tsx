"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteBlogButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <button
      className="text-sm border border-default rounded px-2 py-1 hover:bg-red-500/10"
      disabled={loading}
      onClick={async () => {
        if (loading) return;
        if (!confirm("Delete blog?")) return;
        setLoading(true);
        try {
          await fetch(`/api/blog/${id}`, { method: "DELETE" });
          router.refresh();
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}

