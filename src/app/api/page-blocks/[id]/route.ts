import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const block = await prisma.pageBlock.findUnique({ where: { id: params.id } });
  if (!block) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(block);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session || sUser?.role !== "SUPER_ADMIN") return new NextResponse("Forbidden", { status: 403 });
  const body = await req.json();
  const updated = await prisma.pageBlock.update({
    where: { id: params.id },
    data: {
      type: body.type,
      path: body.path,
      locale: body.locale,
      position: typeof body.position === "number" ? body.position : undefined,
      data: typeof body.data !== "undefined" ? body.data : undefined,
      audiences: typeof body.audiences !== "undefined" ? body.audiences : undefined,
      published: typeof body.published === "boolean" ? body.published : undefined,
    } as any,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session || sUser?.role !== "SUPER_ADMIN") return new NextResponse("Forbidden", { status: 403 });
  await prisma.pageBlock.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}

