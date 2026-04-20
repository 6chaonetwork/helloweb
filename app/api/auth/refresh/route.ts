import { NextResponse } from "next/server";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";
import { refreshAuthSession } from "@/lib/auth-session";

function resolveStatusCode(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("required")) return 400;
  if (normalized.includes("invalid")) return 401;
  if (normalized.includes("expired")) return 401;
  if (normalized.includes("device mismatch")) return 401;
  if (normalized.includes("user unavailable")) return 403;
  return 500;
}

export function OPTIONS(request: Request) {
  return buildCorsPreflightResponse(request.headers.get("origin"));
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const body = await request.json().catch(() => ({}));
  const forwardedFor = request.headers.get("x-forwarded-for");
  const loginIp = forwardedFor?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || null;

  try {
    const result = await refreshAuthSession({
      refreshToken: typeof body.refreshToken === "string" ? body.refreshToken : "",
      clientDeviceId: typeof body.deviceId === "string" ? body.deviceId : null,
      deviceName: typeof body.deviceName === "string" ? body.deviceName : null,
      deviceType: typeof body.deviceType === "string" ? body.deviceType : null,
      platform: typeof body.platform === "string" ? body.platform : null,
      clientVersion: typeof body.clientVersion === "string" ? body.clientVersion : null,
      loginIp,
    });

    return withCors(NextResponse.json(result), origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to refresh session";
    return withCors(
      NextResponse.json({ success: false, error: message }, { status: resolveStatusCode(message) }),
      origin,
    );
  }
}
