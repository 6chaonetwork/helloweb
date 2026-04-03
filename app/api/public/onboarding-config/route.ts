import { NextResponse } from "next/server";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";
import { getPublicOnboardingConfig } from "@/lib/onboarding-config";

export function OPTIONS(request: Request) {
  return buildCorsPreflightResponse(request.headers.get("origin"));
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const onboardingConfig = await getPublicOnboardingConfig();

  return withCors(
    NextResponse.json(onboardingConfig, {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    }),
    origin,
  );
}
