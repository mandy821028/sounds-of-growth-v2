import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const type = String(body?.type || "").toUpperCase();
    if (!type) return NextResponse.json({ error: "type required" }, { status: 400 });
    const created = await prisma.analyticsEvent.create({
      data: {
        type,
        targetId: body?.targetId ?? null,
        path: body?.path ?? "/",
        locale: body?.locale ?? null,
        meta: body?.meta ?? null,
      } as any,
    });
    return NextResponse.json({ ok: true, id: created.id });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

