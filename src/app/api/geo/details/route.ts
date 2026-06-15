import { NextResponse } from "next/server";
import { requireSession, isAuthError } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = await requireSession();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId");
  const locale = searchParams.get("lang") || "en";
  if (!placeId || !process.env.GOOGLE_MAPS_API_KEY) {
    return NextResponse.json({});
  }
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
    placeId
  )}&fields=formatted_address,geometry&language=${locale}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return NextResponse.json(data);
}


