import { cookies } from "next/headers";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";
  const t = {
    title: locale === "es" ? "Biblioteca multimedia" : "Media library",
    upload: locale === "es" ? "Subir archivos" : "Upload files",
    files: locale === "es" ? "Archivos" : "Files",
    delete: locale === "es" ? "Eliminar" : "Delete",
    empty: locale === "es" ? "Sin archivos todavía." : "No files yet.",
    grid: locale === "es" ? "Cuadrícula" : "Grid",
    list: locale === "es" ? "Lista" : "List",
  };
  // Read directly from disk to avoid any fetch/base-url issues
  const assetsDir = path.join(process.cwd(), "public", "assets");
  await fs.mkdir(assetsDir, { recursive: true });
  const entries = await fs.readdir(assetsDir, { withFileTypes: true });
  const items = await Promise.all(
    entries.filter(e=>e.isFile() && !e.name.startsWith(".")).map(async (e) => {
      const full = path.join(assetsDir, e.name);
      const st = await fs.stat(full);
      return {
        name: e.name,
        url: `/assets/${encodeURIComponent(e.name)}`,
        size: st.size,
        mtime: st.mtime.toISOString(),
      };
    })
  );
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t.title}</h1>
      {/* Client upload */}
      {/* @ts-expect-error Async Server/Client boundary handled by file */}
      <UploadWidget label={t.upload} />
      {/* Browser with Grid/List toggle */}
      {/* @ts-expect-error Client boundary */}
      <MediaBrowser items={items} labels={{ files: t.files, delete: t.delete, grid: t.grid, list: t.list, empty: t.empty }} />
    </div>
  );
}

// Inline client components via separate files to avoid handlers in server
import UploadWidget from "./upload/UploadMedia.client";
import MediaBrowser from "./upload/MediaBrowser.client";

