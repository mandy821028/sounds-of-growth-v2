import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

function normalizeLocale(v: unknown) {
  return v === "es" ? ("es" as const) : ("en" as const);
}

function normalizeTarget(v: unknown) {
  return v === "_blank" ? "_blank" : "_self";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = normalizeLocale(searchParams.get("locale"));
  const enabledOnly = searchParams.get("enabled") === "true";

  const items = await prisma.sliderItem.findMany({
    where: {
      locale,
      ...(enabledOnly ? { enabled: true } : {}),
    },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session || sUser?.role !== "SUPER_ADMIN") return new NextResponse("Forbidden", { status: 403 });

  const body: unknown = await req.json().catch(() => null);
  const obj: Record<string, unknown> = body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  const locale = obj.locale;
  const title = typeof obj.title === "string" ? obj.title : "";
  const subtitle = typeof obj.subtitle === "string" ? obj.subtitle : "";
  const imageUrl = typeof obj.imageUrl === "string" ? obj.imageUrl : "";
  const buttonLabel = typeof obj.buttonLabel === "string" ? obj.buttonLabel : "";
  const buttonHref = typeof obj.buttonHref === "string" ? obj.buttonHref : "";
  const buttonTarget = obj.buttonTarget;
  const order = typeof obj.order === "number" ? obj.order : Number(obj.order ?? 0);
  const enabled = typeof obj.enabled === "boolean" ? obj.enabled : Boolean(obj.enabled ?? true);

  if (!title.trim()) return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (!imageUrl.trim()) return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });

  const href = buttonHref.trim();
  const label = buttonLabel.trim();
  if (href && !label) return NextResponse.json({ error: "buttonLabel is required when buttonHref is set" }, { status: 400 });
  if (label && !href) return NextResponse.json({ error: "buttonHref is required when buttonLabel is set" }, { status: 400 });

  const created = await prisma.sliderItem.create({
    data: {
      locale: normalizeLocale(locale),
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      imageUrl: imageUrl.trim(),
      buttonLabel: label || null,
      buttonHref: href || null,
      buttonTarget: normalizeTarget(buttonTarget),
      order: Number.isFinite(order) ? order : 0,
      enabled,
    },
  });

  return NextResponse.json(created, { status: 201 });
}

