import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/admin";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";
import { buildUsbBindingId, normalizeUsbFingerprint } from "@/lib/usb-license";
import { verifyUsbDirectIssuePassword } from "@/lib/usb-license-password";
import { issueUsbLicense } from "@/lib/usb-license-service";

export function OPTIONS(request: Request) {
  return buildCorsPreflightResponse(request.headers.get("origin"));
}

function parseOptionalIsoDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("expiresAt is invalid");
  }
  return date;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  try {
    const body = (await request.json()) as {
      usbBindingId?: string;
      usbFingerprint?: unknown;
      runtimeRootHint?: string;
      driveLetter?: string;
      volumeLabel?: string;
      friendlyName?: string;
      devicePlatform?: string;
      customerName?: string;
      submitterName?: string;
      applicantNote?: string;
      notes?: string;
      expiresAt?: string;
      password?: string;
    };

    const password = (body.password || "").trim();
    if (!password) {
      return withCors(NextResponse.json({ success: false, error: "password is required" }, { status: 400 }), origin);
    }

    const passwordOk = await verifyUsbDirectIssuePassword(password);
    if (!passwordOk) {
      return withCors(
        NextResponse.json({ success: false, error: "password is invalid or direct issue is not configured" }, { status: 403 }),
        origin,
      );
    }

    const usbFingerprint = normalizeUsbFingerprint(body.usbFingerprint);
    const usbBindingId = (body.usbBindingId || "").trim() || buildUsbBindingId(usbFingerprint);
    if (!usbBindingId) {
      return withCors(NextResponse.json({ success: false, error: "usbBindingId is required" }, { status: 400 }), origin);
    }

    const expiresAt = parseOptionalIsoDate(body.expiresAt);
    const result = await prisma.$transaction((tx) =>
      issueUsbLicense(tx, {
        usbBindingId,
        usbFingerprint,
        customerName: body.customerName ?? null,
        notes: body.notes ?? body.applicantNote ?? null,
        expiresAt,
        runtimeRootHint: body.runtimeRootHint ?? null,
        driveLetter: body.driveLetter ?? null,
        volumeLabel: body.volumeLabel ?? null,
        friendlyName: body.friendlyName ?? usbFingerprint.friendlyName ?? null,
        devicePlatform: body.devicePlatform ?? null,
        submitterName: body.submitterName ?? null,
        applicantNote: body.applicantNote ?? null,
      }),
    );

    await createAuditLog({
      action: "usb_license_direct_issued",
      targetType: "UsbLicense",
      targetId: result.licenseRecord.id,
      metadataJson: {
        usbBindingId,
        duplicated: result.duplicated,
        submitterName: body.submitterName ?? null,
      },
    });

    return withCors(
      NextResponse.json({
        success: true,
        duplicated: result.duplicated,
        status: "APPROVED",
        requestId: result.requestRecord?.id ?? null,
        licenseId: result.licenseRecord.licenseId,
        usbBindingId,
        license: result.licenseRecord.signedLicenseJson,
      }),
      origin,
    );
  } catch (error) {
    return withCors(
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "direct issue failed",
        },
        { status: 500 },
      ),
      origin,
    );
  }
}
