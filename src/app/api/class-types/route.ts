import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { z } from "zod";

export async function GET() {
  const all = await prisma.classType.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json();
  const parsed = z.object({ name: z.string().min(1) }).safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.format(), { status: 400 });
  const ct = await prisma.classType.create({ data: { name: parsed.data.name } });
  return NextResponse.json(ct, { status: 201 });
}


