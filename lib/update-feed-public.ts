export type PublicDesktopUpdateManifest = {
  version: string;
  fileName: string;
  sha256: string;
  publishedAt?: string;
  notes?: string;
};

export type PublicDesktopUpdateDistributionConfig = {
  deliveryMode: "local" | "oss";
  ossBaseUrl?: string;
};

export function buildPublicDesktopUpdateManifestUrl(request: Request): string {
  const configuredBaseUrl = process.env.HELLOCLAW_UPDATE_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return new URL(
      "./manifest.json",
      configuredBaseUrl.endsWith("/") ? configuredBaseUrl : `${configuredBaseUrl}/`,
    ).toString();
  }

  const origin = new URL(request.url).origin;
  return `${origin}/updates/desktop/windows-x64/manifest.json`;
}

export function buildPublicDesktopUpdateConfigUrl(request: Request): string {
  const origin = new URL(request.url).origin;
  return `${origin}/updates/desktop/windows-x64/distribution.config.json`;
}

export async function readPublicDesktopUpdateDistributionConfig(
  request: Request,
): Promise<PublicDesktopUpdateDistributionConfig> {
  const configUrl = buildPublicDesktopUpdateConfigUrl(request);
  try {
    const response = await fetch(configUrl, { cache: "no-store" });
    if (!response.ok) {
      return { deliveryMode: "local", ossBaseUrl: "" };
    }
    const parsed = (await response.json()) as Partial<PublicDesktopUpdateDistributionConfig>;
    return {
      deliveryMode: parsed.deliveryMode === "oss" ? "oss" : "local",
      ossBaseUrl: typeof parsed.ossBaseUrl === "string" ? parsed.ossBaseUrl.trim() : "",
    };
  } catch {
    return { deliveryMode: "local", ossBaseUrl: "" };
  }
}

export function buildPublicDesktopUpdateDownloadUrl(request: Request, fileName: string): string {
  const configuredBaseUrl = process.env.HELLOCLAW_UPDATE_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return new URL(
      `./${fileName}`,
      configuredBaseUrl.endsWith("/") ? configuredBaseUrl : `${configuredBaseUrl}/`,
    ).toString();
  }

  const origin = new URL(request.url).origin;
  return `${origin}/updates/desktop/windows-x64/${encodeURIComponent(fileName)}`;
}
