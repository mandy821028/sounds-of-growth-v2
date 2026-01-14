import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const assetsDir = path.join(process.cwd(), "public", "assets");
const ensureDir = async () => {
  try {
    await fs.mkdir(assetsDir, { recursive: true });
  } catch {}
};
const isSafeName = (name: string) => !name.includes("..") && !name.includes("/") && !name.includes("\\");

export async function GET() {
  await ensureDir();
  const entries = await fs.readdir(assetsDir, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((e) => e.isFile() && !e.name.startsWith("."))
      .map(async (e) => {
        const full = path.join(assetsDir, e.name);
        const st = await fs.stat(full);
        return {
          name: e.name,
          size: st.size,
          mtime: st.mtime,
          url: `/assets/${encodeURIComponent(e.name)}`,
        };
      })
  );
  files.sort((a, b) => a.name.localeCompare(b.name));
  return NextResponse.json(files);
}

export async function POST(req: NextRequest) {
  await ensureDir();
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  const entries = form.getAll("file");
  if (!entries || entries.length === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  const saved: Array<{ name: string; url: string }> = [];
  for (const entry of entries) {
    if (!(entry instanceof File)) continue;
    const origName = entry.name || "upload.bin";
    const base = path.basename(origName);
    const safeName = isSafeName(base) ? base : `file-${Date.now()}`;
    const finalName = await uniqueName(safeName);
    const buf = Buffer.from(await entry.arrayBuffer());
    await fs.writeFile(path.join(assetsDir, finalName), buf);
    saved.push({ name: finalName, url: `/assets/${encodeURIComponent(finalName)}` });
  }
  return NextResponse.json({ files: saved }, { status: 201 });
}

async function uniqueName(name: string): Promise<string> {
  const ext = path.extname(name);
  const stem = path.basename(name, ext);
  let n = name;
  let i = 1;
  // Avoid overwriting: add (1), (2), ...
  while (true) {
    try {
      await fs.access(path.join(assetsDir, n));
      n = `${stem} (${i})${ext}`;
      i++;
    } catch {
      return n;
    }
  }
}

