"use client";
import { useState } from "react";

type BlogPost = {
  id: string;
  locale: "en" | "es";
  title: string;
  slug: string;
  excerpt: string | null;
  tag: string | null;
  imageUrl: string | null;
  published: boolean;
};

export default function EditBlogForm({ post }: { post: BlogPost }) {
  const [locale, setLocale] = useState<"en" | "es">(post.locale);
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt || "");
  const [tag, setTag] = useState(post.tag || "");
  const [imageUrl, setImageUrl] = useState(post.imageUrl || "");
  const [published, setPublished] = useState(post.published);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function save() {
    setLoading(true);
    setError(undefined);
    try {
      const res = await fetch(`/api/blog/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, title, slug, excerpt, tag, imageUrl, published }),
      });
      if (!res.ok) throw new Error();
      location.href = "/super-admin/blogs";
    } catch {
      setError("Error saving");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Edit Blog</h1>
      {error && <div className="text-sm text-red-500">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm">
          Locale
          <select value={locale} onChange={(e) => setLocale(e.target.value as any)} className="block mt-1 border border-default rounded px-2 py-1 bg-card">
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
        </label>
        <label className="text-sm">
          Tag
          <input value={tag} onChange={(e) => setTag(e.target.value)} className="block w-full mt-1 border border-default rounded px-2 py-1 bg-card" />
        </label>
        <label className="text-sm md:col-span-2">
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="block w-full mt-1 border border-default rounded px-2 py-1 bg-card" required />
        </label>
        <label className="text-sm">
          Slug
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="block w-full mt-1 border border-default rounded px-2 py-1 bg-card" required />
        </label>
        <label className="text-sm">
          Image URL
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="block w-full mt-1 border border-default rounded px-2 py-1 bg-card" />
        </label>
        <label className="text-sm md:col-span-2">
          Excerpt
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className="block w-full mt-1 border border-default rounded px-2 py-1 bg-card" />
        </label>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published
        </label>
      </div>
      <div className="flex gap-2">
        <button className="border border-default rounded px-3 py-1 hover:bg-primary/10" onClick={save} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={() => history.back()} className="border border-default rounded px-3 py-1">
          Cancel
        </button>
      </div>
    </div>
  );
}

