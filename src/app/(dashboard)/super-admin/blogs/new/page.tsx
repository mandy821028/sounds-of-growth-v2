"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewBlogPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<"en"|"es">("en");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tag, setTag] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    const res = await fetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, title, slug, excerpt, tag, imageUrl, published }),
    });
    if (!res.ok) {
      const j = await res.json().catch(()=>({error:"Error"}));
      setError(j.error || "Error");
      setLoading(false);
      return;
    }
    router.push("/super-admin/blogs");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-xl font-semibold">New Blog</h1>
      {error && <div className="text-sm text-red-500">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm">Locale
          <select className="block mt-1 border border-default rounded px-2 py-1 bg-card" value={locale} onChange={(e)=>setLocale(e.target.value as any)}>
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
        </label>
        <label className="text-sm">Tag
          <input className="block w-full mt-1 border border-default rounded px-2 py-1 bg-card" value={tag} onChange={(e)=>setTag(e.target.value)} />
        </label>
        <label className="text-sm md:col-span-2">Title
          <input className="block w-full mt-1 border border-default rounded px-2 py-1 bg-card" value={title} onChange={(e)=>{setTitle(e.target.value); if(!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''));}} required />
        </label>
        <label className="text-sm">Slug
          <input className="block w-full mt-1 border border-default rounded px-2 py-1 bg-card" value={slug} onChange={(e)=>setSlug(e.target.value)} required />
        </label>
        <label className="text-sm">Image URL
          <input className="block w-full mt-1 border border-default rounded px-2 py-1 bg-card" value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} />
        </label>
        <label className="text-sm md:col-span-2">Excerpt
          <textarea className="block w-full mt-1 border border-default rounded px-2 py-1 bg-card" rows={3} value={excerpt} onChange={(e)=>setExcerpt(e.target.value)} />
        </label>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={published} onChange={(e)=>setPublished(e.target.checked)} /> Published
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="border border-default rounded px-3 py-1 hover:bg-primary/10">{loading? "Saving..." : "Save"}</button>
        <button type="button" onClick={()=>history.back()} className="border border-default rounded px-3 py-1">Cancel</button>
      </div>
    </form>
  );
}

