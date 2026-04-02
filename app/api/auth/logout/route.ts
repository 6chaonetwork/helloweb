import { NextResponse } from "next/server";
import { parseBearerToken, revokeAuthSession } from "@/lib/auth-session";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";

export function OPTIONS(request: Request) {
  return buildCorsPreflightResponse(request.headers.get("origin"));
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const body = await request.json().catch(() => ({}));
  const accessToken = parseBearerToken(request.headers.get("authorization"));
  const refreshToken = typeof body.refreshToken === "string" ? body.refreshToken : null;

  const result = await revokeAuthSession({
    accessToken,
    refreshToken,
  });

  return withCors(NextResponse.json(result), origin);
}
