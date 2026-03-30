import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "https://helloclaw.top",
  "https://www.helloclaw.top",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "capacitor://localhost",
  "app://-",
];

export function getCorsHeaders(origin?: string | null) {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

export function withCors(response: NextResponse, origin?: string | null) {
  const headers = getCorsHeaders(origin);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export function buildCorsPreflightResponse(origin?: string | null) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}
