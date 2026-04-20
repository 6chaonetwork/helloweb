import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";
import { getPublicDesktopUpdateFilePath, publicDesktopUpdateFileExists } from "@/lib/update-feed-public";

export function OPTIONS(request: Request) {
  return buildCorsPreflightResponse(request.headers.get("origin"));
}

export async function GET(
  request: Request,
  context: { params: Promise<{ fileName: string }> },
) {
  const origin = request.headers.get("origin");
  const { fileName } = await context.params;
  const filePath = getPublicDesktopUpdateFilePath(fileName);

  if (!publicDesktopUpdateFileExists(fileName)) {
    return withCors(
      NextResponse.json({ success: false, error: "Patch file not found" }, { status: 404 }),
      origin,
    );
  }

  const fileBuffer = await readFile(filePath);
  return withCors(
    new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "public, max-age=300",
      },
    }),
    origin,
  );
}
