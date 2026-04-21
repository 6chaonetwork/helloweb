import { NextResponse } from "next/server";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";
import {
  buildPublicDesktopUpdateDownloadUrl,
  readPublicDesktopUpdateDistributionConfig,
  readPublicDesktopUpdateFileSize,
  readPublicDesktopUpdateManifest,
} from "@/lib/update-feed-public";

export function OPTIONS(request: Request) {
  return buildCorsPreflightResponse(request.headers.get("origin"));
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const distributionConfig = await readPublicDesktopUpdateDistributionConfig();
  const manifest = await readPublicDesktopUpdateManifest();
  if (!manifest) {
    return withCors(
      NextResponse.json(
        { success: false, error: "No published desktop update" },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      ),
      origin,
    );
  }

  const sizeBytes = manifest.sizeBytes ?? await readPublicDesktopUpdateFileSize(manifest.fileName.trim());

  return withCors(
    NextResponse.json(
      {
        success: true,
        version: manifest.version.trim(),
        fileName: manifest.fileName.trim(),
        sha256: manifest.sha256.trim().toLowerCase(),
        downloadUrl:
          distributionConfig.deliveryMode === "oss" && distributionConfig.ossBaseUrl
            ? new URL(
                `./${manifest.fileName.trim()}`,
                distributionConfig.ossBaseUrl.endsWith("/")
                  ? distributionConfig.ossBaseUrl
                  : `${distributionConfig.ossBaseUrl}/`,
              ).toString()
            : buildPublicDesktopUpdateDownloadUrl(request, manifest.fileName),
        publishedAt: manifest.publishedAt ?? null,
        notes: manifest.notes ?? null,
        sizeBytes,
        deliveryMode: distributionConfig.deliveryMode,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=30",
        },
      },
    ),
    origin,
  );
}
