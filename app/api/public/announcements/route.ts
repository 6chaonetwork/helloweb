import { NextResponse } from "next/server";
import { listActiveAnnouncements } from "@/lib/announcements";

export async function GET() {
  const items = await listActiveAnnouncements();
  return NextResponse.json(
    { items },
    {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    },
  );
}
