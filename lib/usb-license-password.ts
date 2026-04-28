import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

type UsbLicensePasswordStore = {
  passwordHash: string;
  updatedAt: string;
};

const STORE_PATH = path.join(process.cwd(), ".local-runtime", "usb-license-password.json");

function ensureStoreDir() {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
}

function readStore(): UsbLicensePasswordStore | null {
  if (!fs.existsSync(STORE_PATH)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_PATH, "utf8")) as Partial<UsbLicensePasswordStore>;
    if (typeof parsed.passwordHash === "string" && parsed.passwordHash.trim()) {
      return {
        passwordHash: parsed.passwordHash,
        updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function getUsbDirectIssuePasswordMeta() {
  const store = readStore();
  return {
    passwordConfigured: Boolean(store?.passwordHash),
    updatedAt: store?.updatedAt ?? null,
  };
}

export async function setUsbDirectIssuePassword(password: string) {
  ensureStoreDir();
  const passwordHash = await bcrypt.hash(password, 10);
  const payload: UsbLicensePasswordStore = {
    passwordHash,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(STORE_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}

export async function verifyUsbDirectIssuePassword(password: string) {
  const store = readStore();
  if (!store?.passwordHash) {
    return false;
  }
  return await bcrypt.compare(password, store.passwordHash);
}
