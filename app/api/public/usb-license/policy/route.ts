import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";

export function OPTIONS(request: Request) {
  return buildCorsPreflightResponse(request.headers.get("origin"));
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  try {
    const body = (await request.json()) as {
      licenseId?: string;
      usbBindingId?: string;
    };

    const licenseId = (body.licenseId || "").trim();
    const usbBindingId = (body.usbBindingId || "").trim();
    if (!licenseId || !usbBindingId) {
      return withCors(
        NextResponse.json(
          { success: false, error: "licenseId and usbBindingId are required" },
          { status: 400 },
        ),
        origin,
      );
    }

    const license = await prisma.usbLicense.findFirst({
      where: {
        licenseId,
        usbBindingId,
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!license) {
      return withCors(
        NextResponse.json({ success: false, error: "USB license not found" }, { status: 404 }),
        origin,
      );
    }

    return withCors(
      NextResponse.json({
        success: true,
        licenseId,
        usbBindingId,
        status: license.status,
        policy: license.signedPolicyJson,
      }),
      origin,
    );
  } catch (error) {
    return withCors(
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to read USB license policy",
        },
        { status: 500 },
      ),
      origin,
    );
  }
}
