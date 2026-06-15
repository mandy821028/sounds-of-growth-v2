import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireRole, isAuthError } from "@/lib/auth";

const assetsDir = path.join(process.cwd(), "public", "assets");

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const auth = await requireRole("SUPER_ADMIN");
  if (isAuthError(auth)) return auth;

  const { name } = await params;
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

