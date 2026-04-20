import { NextResponse } from "next/server";
import { consumeApprovedQrChallenge } from "@/lib/auth-session";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";

function resolveStatusCode(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("not found")) return 404;
  if (normalized.includes("expired")) return 409;
  if (normalized.includes("not approved")) return 409;
  if (normalized.includes("already consumed")) return 409;
  if (normalized.includes("linked user")) return 409;
  if (normalized.includes("user unavailable")) return 403;
  return 500;
}

export function OPTIONS(request: Request) {
  return buildCorsPreflightResponse(request.headers.get("origin"));
}

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const origin = request.headers.get("origin");
  const { token } = await context.params;
  const body = await request.json().catch(() => ({}));
  const forwardedFor = request.headers.get("x-forwarded-for");
  const loginIp = forwardedFor?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || null;

  try {
    const result = await consumeApprovedQrChallenge({
      qrToken: token,
      clientDeviceId: typeof body.deviceId === "string" ? body.deviceId : null,
      deviceName: typeof body.deviceName === "string" ? body.deviceName : null,
      deviceType: typeof body.deviceType === "string" ? body.deviceType : null,
      platform: typeof body.platform === "string" ? body.platform : null,
      clientVersion: typeof body.clientVersion === "string" ? body.clientVersion : null,
      loginIp,
    });

    return withCors(NextResponse.json(result), origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to consume QR challenge";
    return withCors(
      NextResponse.json({ success: false, error: message }, { status: resolveStatusCode(message) }),
      origin,
    );
  }
}
