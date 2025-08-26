import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get("q") || "";
  const locale = searchParams.get("lang") || "en";
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return NextResponse.json({ predictions: [] });
  }
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&types=address&language=${locale}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return NextResponse.json(data);
}


