import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, block, meta } = body || {};
    if (!action || !block) return new NextResponse("Bad request", { status: 400 });
    const cookieStore = await cookies();
    const locale = cookieStore.get("locale")?.value || "en";
    const path = new URL(req.url).searchParams.get("path") || "/";
    await prisma.eventLog.create({
      data: {
        action: String(action),
        block: String(block),
        path,
        locale,
        meta: meta ?? {},
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return new NextResponse("Error", { status: 500 });
  }
}

