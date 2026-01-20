import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const assetsDir = path.join(process.cwd(), "public", "assets");

export async function DELETE(_req: NextRequest, { params }: { params: { name: string } }) {
  const name = params.name;
  if (!name || name.includes("..") || name.includes("/") || name.includes("\\")) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }
  try {
    await fs.unlink(path.join(assetsDir, name));
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as any).code === "ENOENT") return NextResponse.json({ ok: true });
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

