"use client";
import { useRef, useState } from "react";

export default function UploadMedia({ label = "Upload files" }: { label?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const form = new FormData();
    for (const f of Array.from(files)) form.append("file", f);
    setUploading(true);
    try {
      const res = await fetch("/api/media", { method: "POST", body: form });
      if (!res.ok) throw new Error();
      location.reload();
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="border border-default rounded bg-card p-3 flex items-center justify-between">
      <div className="text-sm">{label}</div>
      <div>
        <input ref={inputRef} type="file" multiple onChange={onPickFiles} className="hidden" />
        <button
          className="border border-default rounded px-3 py-1 hover:bg-primary/10"
          onClick={()=>inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Select files"}
        </button>
      </div>
    </div>
  );
}

