import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true, email: true, phone: true, locale: true, image: true } });
  return NextResponse.json(user);
}

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional().nullable(),
  locale: z.enum(["en", "es"]),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.format(), { status: 400 });
  const { firstName, lastName, phone, locale } = parsed.data;
  const user = await prisma.user.update({ where: { id: userId }, data: { firstName, lastName, phone: phone ?? undefined, locale } });
  return NextResponse.json({ ok: true, user: { firstName: user.firstName, lastName: user.lastName, phone: user.phone, locale: user.locale, image: user.image } });
}


