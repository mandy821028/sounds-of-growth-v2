import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const grouped = await prisma.eventLog.groupBy({
      by: ["block", "action"],
      _count: { _all: true },
      orderBy: [{ block: "asc" }, { action: "asc" }],
    });
    return NextResponse.json(grouped);
  } catch (e) {
    return new NextResponse("Error", { status: 500 });
  }
}

