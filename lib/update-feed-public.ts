import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

export type PublicDesktopUpdateManifest = {
  version: string;
  fileName: string;
  sha256: string;
  publishedAt?: string;
  notes?: string;
  sizeBytes?: number;
};

export type PublicDesktopUpdateDistributionConfig = {
  deliveryMode: "local" | "oss";
  ossBaseUrl?: string;
};

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PUBLIC_UPDATE_DIR = path.join(
  /* turbopackIgnore: true */
  MODULE_DIR,
  "..",
  "public",
  "updates",
  "desktop",
  "windows-x64",
);
const DEFAULT_PUBLIC_SITE_ORIGIN = "https://helloclaw.top";

function getManifestPath(): string {
  return process.env.HELLOCLAW_UPDATE_MANIFEST_PATH?.trim()
    || path.join(DEFAULT_PUBLIC_UPDATE_DIR, "manifest.json");
}

function getDistributionConfigPath(): string {
  return process.env.HELLOCLAW_UPDATE_CONFIG_PATH?.trim()
    || path.join(DEFAULT_PUBLIC_UPDATE_DIR, "distribution.config.json");
}

export function getPublicDesktopUpdateDir(): string {
  return process.env.HELLOCLAW_PUBLIC_UPDATE_DIR?.trim()
    || DEFAULT_PUBLIC_UPDATE_DIR;
}

export function getPublicDesktopUpdateFilePath(fileName: string): string {
  return path.join(getPublicDesktopUpdateDir(), path.basename(fileName));
}

export async function readPublicDesktopUpdateManifest(): Promise<PublicDesktopUpdateManifest | null> {
  const manifestPath = getManifestPath();

  try {
    const raw = (await readFile(manifestPath, "utf8")).replace(/^\uFEFF/, "");
    const parsed = JSON.parse(raw) as Partial<PublicDesktopUpdateManifest>;

    if (
      typeof parsed.version !== "string"
      || typeof parsed.fileName !== "string"
      || typeof parsed.sha256 !== "string"
    ) {
      return null;
    }

    return {
      version: parsed.version.trim(),
      fileName: parsed.fileName.trim(),
      sha256: parsed.sha256.trim().toLowerCase(),
      publishedAt: typeof parsed.publishedAt === "string" ? parsed.publishedAt : undefined,
      notes: typeof parsed.notes === "string" ? parsed.notes : undefined,
      sizeBytes:
        typeof parsed.sizeBytes === "number" && Number.isFinite(parsed.sizeBytes) && parsed.sizeBytes > 0
          ? parsed.sizeBytes
          : undefined,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function readPublicDesktopUpdateFileSize(fileName: string): Promise<number | null> {
  try {
    const fileStat = await stat(getPublicDesktopUpdateFilePath(fileName));
    return fileStat.isFile() ? fileStat.size : null;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function readPublicDesktopUpdateDistributionConfig(): Promise<PublicDesktopUpdateDistributionConfig> {
  const configPath = getDistributionConfigPath();

  try {
    const raw = (await readFile(configPath, "utf8")).replace(/^\uFEFF/, "");
    const parsed = JSON.parse(raw) as Partial<PublicDesktopUpdateDistributionConfig>;
    return {
      deliveryMode: parsed.deliveryMode === "oss" ? "oss" : "local",
      ossBaseUrl: typeof parsed.ossBaseUrl === "string" ? parsed.ossBaseUrl.trim() : "",
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { deliveryMode: "local", ossBaseUrl: "" };
    }
    throw error;
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

  const origin = process.env.HELLOCLAW_PUBLIC_SITE_ORIGIN?.trim()
    || DEFAULT_PUBLIC_SITE_ORIGIN
    || new URL(request.url).origin;
  return `${origin}/api/public/update/file/${encodeURIComponent(fileName)}`;
}

export function publicDesktopUpdateFileExists(fileName: string): boolean {
  return existsSync(getPublicDesktopUpdateFilePath(fileName));
}
