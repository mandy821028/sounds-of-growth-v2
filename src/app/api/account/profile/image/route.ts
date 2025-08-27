import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return new NextResponse("Bad Request", { status: 400 });
  // simple in-memory to base64 data URL storage for demo; in real app use S3 or similar
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mime = file.type || "image/png";
  const dataUrl = `data:${mime};base64,${base64}`;
  await prisma.user.update({ where: { id: userId }, data: { image: dataUrl } });
  return NextResponse.json({ url: dataUrl });
}


