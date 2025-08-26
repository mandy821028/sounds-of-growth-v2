import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookies = request.headers.get("cookie") || "";
  console.log("[debug/session] incoming", { url: url.toString(), cookies });
  const session = await getServerSession(authOptions);
  console.log("[debug/session] session?", Boolean(session), session?.user);
  return NextResponse.json({ session }, { status: 200 });
}


