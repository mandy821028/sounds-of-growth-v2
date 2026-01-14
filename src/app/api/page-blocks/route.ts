import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const locale = url.searchParams.get("locale") ?? "en";
  const path = url.searchParams.get("path") ?? "/";
  const blocks = await prisma.pageBlock.findMany({
    where: { locale, path },
    orderBy: { position: "asc" },
  });
  return NextResponse.json(blocks);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session || sUser?.role !== "SUPER_ADMIN") return new NextResponse("Forbidden", { status: 403 });
  const body = await req.json();
  const created = await prisma.pageBlock.create({
    data: {
      type: body.type,
      path: body.path ?? "/",
      locale: body.locale ?? "en",
      position: Number(body.position ?? 0),
      data: body.data ?? {},
      audiences: body.audiences ?? null,
      published: Boolean(body.published ?? true),
    } as any,
  });
  return NextResponse.json(created, { status: 201 });
}

