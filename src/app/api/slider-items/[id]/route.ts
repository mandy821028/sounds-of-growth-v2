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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const item = await prisma.sliderItem.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session || sUser?.role !== "SUPER_ADMIN") return new NextResponse("Forbidden", { status: 403 });

  const body: unknown = await req.json().catch(() => null);
  const obj: Record<string, unknown> = body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  const locale = obj.locale;
  const title = obj.title;
  const subtitle = obj.subtitle;
  const imageUrl = obj.imageUrl;
  const buttonLabel = obj.buttonLabel;
  const buttonHref = obj.buttonHref;
  const buttonTarget = obj.buttonTarget;
  const order = obj.order;
  const enabled = obj.enabled;

  // If one of label/href is being updated, validate the pair using final values
  const current = await prisma.sliderItem.findUnique({ where: { id: params.id } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nextHrefRaw =
    buttonHref !== undefined
      ? (typeof buttonHref === "string" ? buttonHref : "")
      : (current.buttonHref ?? "");
  const nextLabelRaw =
    buttonLabel !== undefined
      ? (typeof buttonLabel === "string" ? buttonLabel : "")
      : (current.buttonLabel ?? "");
  const nextHref = nextHrefRaw.toString().trim();
  const nextLabel = nextLabelRaw.toString().trim();
  if (nextHref && !nextLabel) return NextResponse.json({ error: "buttonLabel is required when buttonHref is set" }, { status: 400 });
  if (nextLabel && !nextHref) return NextResponse.json({ error: "buttonHref is required when buttonLabel is set" }, { status: 400 });

  if (title !== undefined && (typeof title !== "string" || !title.trim()))
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (imageUrl !== undefined && (typeof imageUrl !== "string" || !imageUrl.trim()))
    return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });

  const updated = await prisma.sliderItem.update({
    where: { id: params.id },
    data: {
      locale: locale === undefined ? undefined : normalizeLocale(locale),
      title: title === undefined ? undefined : String(title).trim(),
      subtitle: subtitle === undefined ? undefined : (typeof subtitle === "string" ? subtitle.trim() : "") || null,
      imageUrl: imageUrl === undefined ? undefined : String(imageUrl).trim(),
      buttonLabel: buttonLabel === undefined ? undefined : nextLabel || null,
      buttonHref: buttonHref === undefined ? undefined : nextHref || null,
      buttonTarget: buttonTarget === undefined ? undefined : normalizeTarget(buttonTarget),
      order: order === undefined ? undefined : Number(order ?? 0),
      enabled: enabled === undefined ? undefined : Boolean(enabled),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session || sUser?.role !== "SUPER_ADMIN") return new NextResponse("Forbidden", { status: 403 });

  await prisma.sliderItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

