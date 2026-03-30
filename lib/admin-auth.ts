import { createHash, timingSafeEqual } from "crypto";

const SESSION_COOKIE_NAME = "helloclaw_admin_session";

type AdminSessionPayload = {
  username: string;
  issuedAt: number;
};

function getAdminUsername() {
  return process.env.ADMIN_USERNAME || "admin";
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "admin123456";
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "helloclaw-dev-session-secret";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string) {
  return createHash("sha256").update(`${payload}.${getAdminSessionSecret()}`).digest("hex");
}

export function createAdminSessionCookieValue(payload: AdminSessionPayload) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function readAdminSessionCookieValue(value?: string | null): AdminSessionPayload | null {
  if (!value) return null;

  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = sign(encodedPayload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  try {
    const parsed = JSON.parse(base64UrlDecode(encodedPayload)) as AdminSessionPayload;
    if (!parsed?.username) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function verifyAdminCredentials(username: string, password: string) {
  return username === getAdminUsername() && password === getAdminPassword();
}

export function getAdminSessionCookieName() {
  return SESSION_COOKIE_NAME;
}
