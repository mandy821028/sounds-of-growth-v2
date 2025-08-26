import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { hash, compare } from "bcrypt";

const schema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.format(), { status: 400 });
  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.hashedPassword) return new NextResponse("Unauthorized", { status: 401 });

  const isValid = await compare(currentPassword, user.hashedPassword);
  if (!isValid) return new NextResponse("Invalid credentials", { status: 401 });

  const newHash = await hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { hashedPassword: newHash, mustChangePassword: false } });
  return NextResponse.json({ ok: true });
}


