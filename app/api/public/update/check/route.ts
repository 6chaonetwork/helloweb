import { NextResponse } from "next/server";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";
import {
  buildPublicDesktopUpdateConfigUrl,
  buildPublicDesktopUpdateDownloadUrl,
  buildPublicDesktopUpdateManifestUrl,
  readPublicDesktopUpdateDistributionConfig,
  type PublicDesktopUpdateManifest,
} from "@/lib/update-feed-public";

export function OPTIONS(request: Request) {
  return buildCorsPreflightResponse(request.headers.get("origin"));
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const manifestUrl = buildPublicDesktopUpdateManifestUrl(request);
  const distributionConfig = await readPublicDesktopUpdateDistributionConfig(request);
  const manifestResponse = await fetch(manifestUrl, {
    cache: "no-store",
  });

  if (!manifestResponse.ok) {
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

  const manifest = (await manifestResponse.json()) as Partial<PublicDesktopUpdateManifest>;
  if (
    typeof manifest.version !== "string"
    || typeof manifest.fileName !== "string"
    || typeof manifest.sha256 !== "string"
  ) {
    return withCors(
      NextResponse.json(
        { success: false, error: "Invalid desktop update manifest" },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      ),
      origin,
    );
  }

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
        deliveryMode: distributionConfig.deliveryMode,
        configUrl: buildPublicDesktopUpdateConfigUrl(request),
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
