import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAuditLog, requireAdmin, requireAdminRole } from "@/lib/admin";
import {
  createSignedUsbLicense,
  createSignedUsbLicensePolicy,
  normalizeUsbFingerprint,
} from "@/lib/usb-license";

function parseOptionalIsoDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("expiresAt is invalid");
  }
  return date;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const [pendingRequests, approvedToday, requests, licenses, activeLicenses, revokedLicenses] = await prisma.$transaction([
    prisma.usbLicenseRequest.count({ where: { status: "PENDING" } }),
    prisma.usbLicense.count({
      where: {
        status: "ACTIVE",
        issuedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.usbLicenseRequest.findMany({
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 60,
    }),
    prisma.usbLicense.findMany({
      orderBy: [{ updatedAt: "desc" }],
      take: 60,
    }),
    prisma.usbLicense.count({ where: { status: "ACTIVE" } }),
    prisma.usbLicense.count({ where: { status: "REVOKED" } }),
  ]);

  return NextResponse.json({
    stats: {
      pendingRequests,
      activeLicenses,
      revokedLicenses,
      approvedToday,
    },
    requests,
    licenses,
  });
}

export async function POST(request: Request) {
  const admin = await requireAdminRole(["SUPER_ADMIN"]);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  try {
    const body = (await request.json()) as {
      action?: "approve" | "reject" | "revoke";
      requestId?: string;
      licenseId?: string;
      customerName?: string;
      notes?: string;
      expiresAt?: string;
      reason?: string;
    };

    if (body.action === "approve") {
      const requestId = (body.requestId || "").trim();
      if (!requestId) {
        return NextResponse.json({ error: "requestId is required" }, { status: 400 });
      }

      const requestRecord = await prisma.usbLicenseRequest.findUnique({
        where: { id: requestId },
      });
      if (!requestRecord) {
        return NextResponse.json({ error: "USB license request not found" }, { status: 404 });
      }

      const expiresAt = parseOptionalIsoDate(body.expiresAt);
      const usbFingerprint = normalizeUsbFingerprint(requestRecord.usbFingerprintJson);
      const signedLicense = createSignedUsbLicense({
        usbBindingId: requestRecord.usbBindingId,
        usbFingerprint,
        customerName: body.customerName ?? requestRecord.customerName,
        notes: body.notes,
        expiresAt: expiresAt?.toISOString() ?? null,
      });
      const signedPolicy = createSignedUsbLicensePolicy({
        licenseId: signedLicense.licenseId,
        usbBindingId: requestRecord.usbBindingId,
        status: "active",
      });

      const existingActiveLicenses = await prisma.usbLicense.findMany({
        where: {
          usbBindingId: requestRecord.usbBindingId,
          status: "ACTIVE",
        },
      });

      const result = await prisma.$transaction(async (tx) => {
        for (const existing of existingActiveLicenses) {
          await tx.usbLicense.update({
            where: { id: existing.id },
            data: {
              status: "REPLACED",
              signedPolicyJson: createSignedUsbLicensePolicy({
                licenseId: existing.licenseId,
                usbBindingId: existing.usbBindingId,
                status: "replaced",
                reason: `Replaced by ${signedLicense.licenseId}`,
              }),
              policyVersion: existing.policyVersion + 1,
              revokedReason: `Replaced by ${signedLicense.licenseId}`,
            },
          });
        }

        const licenseRecord = await tx.usbLicense.create({
          data: {
            licenseId: signedLicense.licenseId,
            requestId: requestRecord.id,
            usbBindingId: requestRecord.usbBindingId,
            status: "ACTIVE",
            customerName: signedLicense.customerName || null,
            notes: signedLicense.notes || null,
            issuedAt: new Date(signedLicense.issuedAt),
            expiresAt: signedLicense.expiresAt ? new Date(signedLicense.expiresAt) : null,
            policyVersion: 1,
            usbFingerprintJson: usbFingerprint,
            signedLicenseJson: signedLicense,
            signedPolicyJson: signedPolicy,
          },
        });

        const updatedRequest = await tx.usbLicenseRequest.update({
          where: { id: requestRecord.id },
          data: {
            status: "APPROVED",
            customerName: signedLicense.customerName || null,
            approvedAt: new Date(),
            rejectedAt: null,
            rejectionReason: null,
            licenseRecordId: licenseRecord.id,
          },
        });

        return { licenseRecord, updatedRequest };
      });

      await createAuditLog({
        userId: admin.user.id,
        action: "usb_license_approved",
        targetType: "UsbLicense",
        targetId: result.licenseRecord.id,
        metadataJson: {
          requestId: requestRecord.id,
          licenseId: result.licenseRecord.licenseId,
          usbBindingId: result.licenseRecord.usbBindingId,
        },
      });

      return NextResponse.json({
        success: true,
        request: result.updatedRequest,
        license: result.licenseRecord,
      });
    }

    if (body.action === "reject") {
      const requestId = (body.requestId || "").trim();
      if (!requestId) {
        return NextResponse.json({ error: "requestId is required" }, { status: 400 });
      }

      const requestRecord = await prisma.usbLicenseRequest.findUnique({
        where: { id: requestId },
      });
      if (!requestRecord) {
        return NextResponse.json({ error: "USB license request not found" }, { status: 404 });
      }

      const updatedRequest = await prisma.usbLicenseRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          rejectedAt: new Date(),
          approvedAt: null,
          rejectionReason: body.reason?.trim() || "Rejected by administrator",
        },
      });

      await createAuditLog({
        userId: admin.user.id,
        action: "usb_license_rejected",
        targetType: "UsbLicenseRequest",
        targetId: requestId,
        metadataJson: {
          usbBindingId: requestRecord.usbBindingId,
          reason: updatedRequest.rejectionReason,
        },
      });

      return NextResponse.json({ success: true, request: updatedRequest });
    }

    if (body.action === "revoke") {
      const licenseId = (body.licenseId || "").trim();
      if (!licenseId) {
        return NextResponse.json({ error: "licenseId is required" }, { status: 400 });
      }

      const licenseRecord = await prisma.usbLicense.findUnique({
        where: { licenseId },
      });
      if (!licenseRecord) {
        return NextResponse.json({ error: "USB license not found" }, { status: 404 });
      }

      const nextPolicyVersion = licenseRecord.policyVersion + 1;
      const revokedReason = body.reason?.trim() || "Revoked by administrator";
      const updatedLicense = await prisma.usbLicense.update({
        where: { id: licenseRecord.id },
        data: {
          status: "REVOKED",
          revokedAt: new Date(),
          revokedReason,
          policyVersion: nextPolicyVersion,
          signedPolicyJson: createSignedUsbLicensePolicy({
            licenseId: licenseRecord.licenseId,
            usbBindingId: licenseRecord.usbBindingId,
            status: "revoked",
            reason: revokedReason,
          }),
        },
      });

      await createAuditLog({
        userId: admin.user.id,
        action: "usb_license_revoked",
        targetType: "UsbLicense",
        targetId: updatedLicense.id,
        metadataJson: {
          licenseId: updatedLicense.licenseId,
          usbBindingId: updatedLicense.usbBindingId,
          reason: revokedReason,
        },
      });

      return NextResponse.json({ success: true, license: updatedLicense });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "USB license mutation failed" },
      { status: 500 },
    );
  }
}
