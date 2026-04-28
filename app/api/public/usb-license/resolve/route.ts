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
      usbBindingId?: string;
    };

    const usbBindingId = (body.usbBindingId || "").trim();
    if (!usbBindingId) {
      return withCors(NextResponse.json({ success: false, error: "usbBindingId is required" }, { status: 400 }), origin);
    }

    const [license, latestRequest] = await Promise.all([
      prisma.usbLicense.findFirst({
        where: { usbBindingId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.usbLicenseRequest.findFirst({
        where: { usbBindingId },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    if (license?.status === "ACTIVE") {
      return withCors(
        NextResponse.json({
          success: true,
          status: "APPROVED",
          requestId: latestRequest?.id ?? null,
          licenseId: license.licenseId,
          usbBindingId,
          license: license.signedLicenseJson,
        }),
        origin,
      );
    }

    if (license?.status === "REVOKED") {
      return withCors(
        NextResponse.json({
          success: true,
          status: "REVOKED",
          requestId: latestRequest?.id ?? null,
          licenseId: license.licenseId,
          usbBindingId,
          reason: license.revokedReason ?? "",
        }),
        origin,
      );
    }

    if (latestRequest?.status === "REJECTED") {
      return withCors(
        NextResponse.json({
          success: true,
          status: "REJECTED",
          requestId: latestRequest.id,
          usbBindingId,
          reason: latestRequest.rejectionReason ?? "",
        }),
        origin,
      );
    }

    if (latestRequest) {
      return withCors(
        NextResponse.json({
          success: true,
          status: latestRequest.status,
          requestId: latestRequest.id,
          usbBindingId,
        }),
        origin,
      );
    }

    return withCors(
      NextResponse.json({
        success: true,
        status: "NOT_FOUND",
        usbBindingId,
      }),
      origin,
    );
  } catch (error) {
    return withCors(
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to resolve USB license",
        },
        { status: 500 },
      ),
      origin,
    );
  }
}
