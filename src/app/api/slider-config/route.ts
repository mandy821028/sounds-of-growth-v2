import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

type Transition = "fade" | "slide";
type TextAnimation = "none" | "fade" | "fade-up";

const DEFAULTS = {
  intervalMs: 6500,
  transition: "fade" as Transition,
  textAnimation: "fade-up" as TextAnimation,
};

function normalizeLocale(v: unknown) {
  return v === "es" ? ("es" as const) : ("en" as const);
}

function normalizeTransition(v: unknown): Transition {
  return v === "slide" ? "slide" : "fade";
}

function normalizeTextAnimation(v: unknown): TextAnimation {
  if (v === "none") return "none";
  if (v === "fade") return "fade";
  return "fade-up";
}

function clampIntervalMs(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return DEFAULTS.intervalMs;
  // keep it sane
  return Math.max(1500, Math.min(20000, Math.round(n)));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = normalizeLocale(searchParams.get("locale"));

  const cfg = await prisma.sliderConfig
    .findUnique({ where: { locale } })
    .catch(() => null);

  return NextResponse.json({
    locale,
    intervalMs: cfg?.intervalMs ?? DEFAULTS.intervalMs,
    transition: (cfg?.transition as Transition | null) ?? DEFAULTS.transition,
    textAnimation: (cfg?.textAnimation as TextAnimation | null) ?? DEFAULTS.textAnimation,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session || sUser?.role !== "SUPER_ADMIN") return new NextResponse("Forbidden", { status: 403 });

  const body: unknown = await req.json().catch(() => null);
  const obj: Record<string, unknown> = body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  const locale = normalizeLocale(obj.locale);
  const intervalMs = clampIntervalMs(obj.intervalMs);
  const transition = normalizeTransition(obj.transition);
  const textAnimation = normalizeTextAnimation(obj.textAnimation);

  const updated = await prisma.sliderConfig.upsert({
    where: { locale },
    create: { locale, intervalMs, transition, textAnimation },
    update: { intervalMs, transition, textAnimation },
  });

  return NextResponse.json(updated);
}

