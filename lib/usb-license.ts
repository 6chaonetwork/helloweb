import { createHash, createPrivateKey, createPublicKey, sign } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const DEFAULT_USB_LICENSE_PRODUCT = "HelloClaw USB";
const DEFAULT_USB_LICENSE_EDITION = "standard";
const DEFAULT_USB_LICENSE_SERVER_BASE_URL = "https://www.helloclaw.top";

export type UsbFingerprint = {
  busType?: string;
  diskNumber?: number | null;
  fileSystem?: string;
  friendlyName?: string;
  partitionGuid?: string;
  serialNumber?: string;
  size?: number;
  uniqueId?: string;
  volumeSerialNumber?: string;
};

export type SignedUsbLicense = {
  version: number;
  licenseId: string;
  usbBindingId: string;
  usbFingerprint: UsbFingerprint | null;
  customerId: string;
  customerName: string;
  product: string;
  edition: string;
  status: "active";
  issuedAt: string;
  expiresAt: string | null;
  notes: string;
  signature: string;
  signer: {
    algorithm: "ed25519";
    publicKeyPem: string;
  };
};

export type SignedUsbLicensePolicy = {
  version: number;
  policyId: string;
  licenseId: string;
  usbBindingId: string;
  status: "active" | "revoked" | "replaced";
  reason: string;
  updatedAt: string;
  signature: string;
  signer: {
    algorithm: "ed25519";
    publicKeyPem: string;
  };
};

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function readPemFileIfPresent(filePath: string | undefined): string {
  const trimmed = filePath?.trim();
  if (!trimmed) return "";
  const resolvedPath = path.isAbsolute(trimmed) ? trimmed : path.resolve(process.cwd(), trimmed);
  if (!existsSync(resolvedPath)) {
    throw new Error(`USB license key file does not exist: ${resolvedPath}`);
  }
  return readFileSync(resolvedPath, "utf8").trim();
}

function resolveUsbLicensePrivateKeyPem(): string {
  const envPem = process.env.HELLOCLAW_USB_LICENSE_PRIVATE_KEY_PEM?.trim();
  if (envPem) return envPem;

  const filePem = readPemFileIfPresent(process.env.HELLOCLAW_USB_LICENSE_PRIVATE_KEY_FILE);
  if (filePem) return filePem;

  throw new Error(
    "USB license private key is not configured. Set HELLOCLAW_USB_LICENSE_PRIVATE_KEY_PEM or HELLOCLAW_USB_LICENSE_PRIVATE_KEY_FILE.",
  );
}

function resolveUsbLicensePublicKeyPem(privateKeyPem: string): string {
  const envPem = process.env.HELLOCLAW_USB_LICENSE_PUBLIC_KEY_PEM?.trim();
  if (envPem) return envPem;

  const filePem = readPemFileIfPresent(process.env.HELLOCLAW_USB_LICENSE_PUBLIC_KEY_FILE);
  if (filePem) return filePem;

  return createPublicKey(privateKeyPem).export({ type: "spki", format: "pem" }).toString().trim();
}

function buildBase64Url(buffer: Buffer): string {
  return buffer.toString("base64url");
}

function signPayload(payload: Record<string, unknown>) {
  const privateKeyPem = resolveUsbLicensePrivateKeyPem();
  const publicKeyPem = resolveUsbLicensePublicKeyPem(privateKeyPem);
  const signature = sign(
    null,
    Buffer.from(stableStringify(payload), "utf8"),
    createPrivateKey(privateKeyPem),
  );

  return {
    signature: buildBase64Url(signature),
    signer: {
      algorithm: "ed25519" as const,
      publicKeyPem,
    },
  };
}

function buildId(prefix: string): string {
  return `${prefix}_${createHash("sha256")
    .update(`${prefix}:${Date.now()}:${Math.random()}`, "utf8")
    .digest("hex")
    .slice(0, 20)}`;
}

export function normalizeUsbFingerprint(input: unknown): UsbFingerprint {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};

  return {
    busType: typeof source.busType === "string" ? source.busType : "",
    diskNumber:
      typeof source.diskNumber === "number" && Number.isFinite(source.diskNumber)
        ? source.diskNumber
        : null,
    fileSystem: typeof source.fileSystem === "string" ? source.fileSystem : "",
    friendlyName: typeof source.friendlyName === "string" ? source.friendlyName : "",
    partitionGuid: typeof source.partitionGuid === "string" ? source.partitionGuid : "",
    serialNumber: typeof source.serialNumber === "string" ? source.serialNumber : "",
    size: typeof source.size === "number" && Number.isFinite(source.size) ? source.size : 0,
    uniqueId: typeof source.uniqueId === "string" ? source.uniqueId : "",
    volumeSerialNumber: typeof source.volumeSerialNumber === "string" ? source.volumeSerialNumber : "",
  };
}

export function buildUsbBindingId(fingerprint: UsbFingerprint): string {
  const canonical = JSON.stringify(fingerprint, Object.keys(fingerprint).sort());
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

export function createSignedUsbLicense(input: {
  usbBindingId: string;
  usbFingerprint: UsbFingerprint | null;
  customerName?: string | null;
  notes?: string | null;
  expiresAt?: string | null;
}) {
  const payload = {
    version: 1,
    licenseId: buildId("lic"),
    usbBindingId: input.usbBindingId,
    usbFingerprint: input.usbFingerprint ?? null,
    customerId: "unassigned",
    customerName: input.customerName?.trim() || "",
    product: DEFAULT_USB_LICENSE_PRODUCT,
    edition: DEFAULT_USB_LICENSE_EDITION,
    status: "active" as const,
    issuedAt: new Date().toISOString(),
    expiresAt: input.expiresAt?.trim() || null,
    notes: input.notes?.trim() || "",
  };

  return {
    ...payload,
    ...signPayload(payload),
  } satisfies SignedUsbLicense;
}

export function createSignedUsbLicensePolicy(input: {
  licenseId: string;
  usbBindingId: string;
  status: "active" | "revoked" | "replaced";
  reason?: string | null;
}) {
  const payload = {
    version: 1,
    policyId: buildId("pol"),
    licenseId: input.licenseId,
    usbBindingId: input.usbBindingId,
    status: input.status,
    reason: input.reason?.trim() || "",
    updatedAt: new Date().toISOString(),
  };

  return {
    ...payload,
    ...signPayload(payload),
  } satisfies SignedUsbLicensePolicy;
}

export function getUsbLicenseServerBaseUrl(): string {
  const configured = process.env.HELLOCLAW_USB_LICENSE_SERVER_BASE_URL?.trim();
  return configured || DEFAULT_USB_LICENSE_SERVER_BASE_URL;
}
