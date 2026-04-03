import { NextResponse } from "next/server";
import { listActiveAnnouncements } from "@/lib/announcements";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";

export function OPTIONS(request: Request) {
  return buildCorsPreflightResponse(request.headers.get("origin"));
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const items = await listActiveAnnouncements();
  return withCors(
    NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "public, max-age=60",
        },
      },
    ),
    origin,
  );
}
