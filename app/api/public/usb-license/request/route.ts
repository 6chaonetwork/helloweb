import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";
import { createAuditLog } from "@/lib/admin";
import { buildUsbBindingId, normalizeUsbFingerprint } from "@/lib/usb-license";

export function OPTIONS(request: Request) {
  return buildCorsPreflightResponse(request.headers.get("origin"));
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
    };

    const usbFingerprint = normalizeUsbFingerprint(body.usbFingerprint);
    const usbBindingId = (body.usbBindingId || "").trim() || buildUsbBindingId(usbFingerprint);
    if (!usbBindingId) {
      return withCors(NextResponse.json({ success: false, error: "usbBindingId is required" }, { status: 400 }), origin);
    }

    const activeLicense = await prisma.usbLicense.findFirst({
      where: {
        usbBindingId,
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (activeLicense) {
      return withCors(
        NextResponse.json({
          success: true,
          status: "APPROVED",
          requestId: activeLicense.requestId,
          licenseId: activeLicense.licenseId,
          usbBindingId,
        }),
        origin,
      );
    }

    const existingRequest = await prisma.usbLicenseRequest.findFirst({
      where: { usbBindingId },
      orderBy: { updatedAt: "desc" },
    });

    const requestRecord = existingRequest
      ? await prisma.usbLicenseRequest.update({
          where: { id: existingRequest.id },
          data: {
            usbFingerprintJson: usbFingerprint,
            runtimeRootHint: body.runtimeRootHint?.trim() || null,
            driveLetter: body.driveLetter?.trim() || null,
            volumeLabel: body.volumeLabel?.trim() || null,
            friendlyName: body.friendlyName?.trim() || usbFingerprint.friendlyName || null,
            devicePlatform: body.devicePlatform?.trim() || null,
            customerName: body.customerName?.trim() || null,
            submitterName: body.submitterName?.trim() || null,
            applicantNote: body.applicantNote?.trim() || null,
            status: "PENDING",
            rejectionReason: null,
            rejectedAt: null,
            approvedAt: null,
            lastSubmittedAt: new Date(),
          },
        })
      : await prisma.usbLicenseRequest.create({
          data: {
            usbBindingId,
            usbFingerprintJson: usbFingerprint,
            runtimeRootHint: body.runtimeRootHint?.trim() || null,
            driveLetter: body.driveLetter?.trim() || null,
            volumeLabel: body.volumeLabel?.trim() || null,
            friendlyName: body.friendlyName?.trim() || usbFingerprint.friendlyName || null,
            devicePlatform: body.devicePlatform?.trim() || null,
            customerName: body.customerName?.trim() || null,
            submitterName: body.submitterName?.trim() || null,
            applicantNote: body.applicantNote?.trim() || null,
          },
        });

    await createAuditLog({
      action: "usb_license_request_submitted",
      targetType: "UsbLicenseRequest",
      targetId: requestRecord.id,
      metadataJson: {
        usbBindingId,
        driveLetter: requestRecord.driveLetter,
        volumeLabel: requestRecord.volumeLabel,
      },
    });

    return withCors(
      NextResponse.json({
        success: true,
        status: requestRecord.status,
        requestId: requestRecord.id,
        usbBindingId,
      }),
      origin,
    );
  } catch (error) {
    return withCors(
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to submit USB license request",
        },
        { status: 500 },
      ),
      origin,
    );
  }
}
