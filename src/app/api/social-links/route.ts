import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const onlyEnabled = url.searchParams.get("enabled") === "true";
  const links = await prisma.socialLink.findMany({
    where: onlyEnabled ? { enabled: true } : {},
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { provider, label, url, iconUrl, order = 0, enabled = true } = body || {};
  if (!provider || !label || !url) {
    return NextResponse.json({ error: "provider, label, url are required" }, { status: 400 });
  }
  const created = await prisma.socialLink.create({
    data: { provider, label, url, iconUrl: iconUrl || null, order, enabled },
  });
  return NextResponse.json(created, { status: 201 });
}

