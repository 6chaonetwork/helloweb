import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type DesktopUpdateManifest = {
  version: string;
  fileName: string;
  sha256: string;
  publishedAt?: string;
  notes?: string;
};

export type DesktopUpdateDistributionConfig = {
  deliveryMode: "local" | "oss";
  ossBaseUrl?: string;
};

export type DesktopUpdateFileRecord = {
  fileName: string;
  size: number;
  updatedAt: string;
  active: boolean;
};

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_PUBLIC_UPDATE_DIR = path.join(
  MODULE_DIR,
  "..",
  "public",
  "updates",
  "desktop",
  "windows-x64",
);

function normalizeSha256(value: string): string {
  return value.trim().toLowerCase();
}

function getManifestPath(): string {
  return process.env.HELLOCLAW_UPDATE_MANIFEST_PATH?.trim()
    || path.join(DEFAULT_PUBLIC_UPDATE_DIR, "manifest.json");
}

function getDistributionConfigPath(): string {
  return process.env.HELLOCLAW_UPDATE_CONFIG_PATH?.trim()
    || path.join(DEFAULT_PUBLIC_UPDATE_DIR, "distribution.config.json");
}

export function getPublicUpdateDir(): string {
  return process.env.HELLOCLAW_PUBLIC_UPDATE_DIR?.trim()
    || DEFAULT_PUBLIC_UPDATE_DIR;
}

function getUpdateArchiveDir(): string {
  return path.join(getPublicUpdateDir(), "_archive");
}

function sanitizeVersionForFilename(version: string): string {
  return version.replace(/[^a-z0-9._-]/gi, "-");
}

function sanitizeBaseName(fileName: string): string {
  return path.basename(fileName).replace(/[^a-z0-9._-]/gi, "-");
}

function ensureAsarExtension(fileName: string): string {
  const lower = fileName.toLowerCase();
  return lower.endsWith(".asar") ? fileName : `${fileName}.asar`;
}

export async function ensureUpdateStorageReady(): Promise<void> {
  await mkdir(getPublicUpdateDir(), { recursive: true });
  await mkdir(getUpdateArchiveDir(), { recursive: true });
}

export async function readDesktopUpdateDistributionConfig(): Promise<DesktopUpdateDistributionConfig> {
  const configPath = getDistributionConfigPath();
  try {
    const raw = (await readFile(configPath, "utf8")).replace(/^\uFEFF/, "");
    const parsed = JSON.parse(raw) as Partial<DesktopUpdateDistributionConfig>;
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

export async function writeDesktopUpdateDistributionConfig(
  input: DesktopUpdateDistributionConfig,
): Promise<DesktopUpdateDistributionConfig> {
  await ensureUpdateStorageReady();
  const normalized: DesktopUpdateDistributionConfig = {
    deliveryMode: input.deliveryMode === "oss" ? "oss" : "local",
    ossBaseUrl: input.ossBaseUrl?.trim() || "",
  };
  await writeFile(
    getDistributionConfigPath(),
    `${JSON.stringify(normalized, null, 2)}\n`,
    "utf8",
  );
  return normalized;
}

export async function readDesktopUpdateManifest(): Promise<DesktopUpdateManifest | null> {
  const manifestPath = getManifestPath();

  try {
    const raw = (await readFile(manifestPath, "utf8")).replace(/^\uFEFF/, "");
    const parsed = JSON.parse(raw) as Partial<DesktopUpdateManifest>;

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
      sha256: normalizeSha256(parsed.sha256),
      publishedAt: typeof parsed.publishedAt === "string" ? parsed.publishedAt : undefined,
      notes: typeof parsed.notes === "string" ? parsed.notes : undefined,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function listDesktopUpdateFiles(): Promise<DesktopUpdateFileRecord[]> {
  await ensureUpdateStorageReady();
  const activeManifest = await readDesktopUpdateManifest();
  const entries = await readdir(getPublicUpdateDir(), { withFileTypes: true });
  const files: DesktopUpdateFileRecord[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.toLowerCase().endsWith(".asar")) continue;
    const filePath = path.join(getPublicUpdateDir(), entry.name);
    const stats = await import("node:fs/promises").then((fs) => fs.stat(filePath));
    files.push({
      fileName: entry.name,
      size: stats.size,
      updatedAt: stats.mtime.toISOString(),
      active: activeManifest?.fileName === entry.name,
    });
  }

  return files.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function computeSha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex").toLowerCase();
}

export function buildDesktopUpdateDownloadUrl(request: Request, fileName: string): string {
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

export async function publishDesktopUpdate(input: {
  version: string;
  notes?: string;
  uploadedFileName: string;
  fileBuffer: Buffer;
}): Promise<DesktopUpdateManifest> {
  await ensureUpdateStorageReady();

  const version = input.version.trim();
  if (!version) {
    throw new Error("Version is required");
  }

  const sha256 = computeSha256(input.fileBuffer);
  const normalizedBaseName = ensureAsarExtension(sanitizeBaseName(input.uploadedFileName || "patch.asar"));
  const fileName = `update-${sanitizeVersionForFilename(version)}-${sha256.slice(0, 12)}-${normalizedBaseName}`;
  const filePath = path.join(getPublicUpdateDir(), fileName);

  const currentManifest = await readDesktopUpdateManifest();
  const manifestPath = getManifestPath();

  if (currentManifest?.fileName && currentManifest.fileName !== fileName) {
    const previousManifestPath = path.join(
      getUpdateArchiveDir(),
      `manifest.${Date.now()}.json`,
    );
    if (existsSync(manifestPath)) {
      await rename(manifestPath, previousManifestPath);
    }
  }

  await writeFile(filePath, input.fileBuffer);

  const manifest: DesktopUpdateManifest = {
    version,
    fileName,
    sha256,
    publishedAt: new Date().toISOString(),
    notes: input.notes?.trim() || undefined,
  };

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}

export async function clearActiveDesktopUpdate(): Promise<void> {
  const manifestPath = getManifestPath();
  if (!existsSync(manifestPath)) {
    return;
  }

  await ensureUpdateStorageReady();
  await rename(
    manifestPath,
    path.join(getUpdateArchiveDir(), `manifest.cleared.${Date.now()}.json`),
  );
}
