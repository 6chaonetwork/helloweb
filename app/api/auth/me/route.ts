import { NextResponse } from "next/server";
import { getAuthContextFromAccessToken, parseBearerToken } from "@/lib/auth-session";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";

export function OPTIONS(request: Request) {
  return buildCorsPreflightResponse(request.headers.get("origin"));
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const accessToken = parseBearerToken(request.headers.get("authorization"));

  if (!accessToken) {
    return withCors(NextResponse.json({ success: false, error: "Missing bearer token" }, { status: 401 }), origin);
  }

  const auth = await getAuthContextFromAccessToken(accessToken);
  if (!auth) {
    return withCors(NextResponse.json({ success: false, error: "Invalid or expired session" }, { status: 401 }), origin);
  }

  return withCors(NextResponse.json({
    success: true,
    user: auth.publicUser,
    device: auth.publicDevice,
    session: auth.session,
  }), origin);
}
