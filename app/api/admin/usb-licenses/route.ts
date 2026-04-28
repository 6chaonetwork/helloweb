import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAuditLog, requireAdmin, requireAdminRole } from "@/lib/admin";
import { createSignedUsbLicensePolicy } from "@/lib/usb-license";
import { issueUsbLicense } from "@/lib/usb-license-service";
import { getUsbDirectIssuePasswordMeta, setUsbDirectIssuePassword } from "@/lib/usb-license-password";

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
    directIssue: {
      ...getUsbDirectIssuePasswordMeta(),
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
      action?: "approve" | "reject" | "revoke" | "set_password";
      requestId?: string;
      licenseId?: string;
      customerName?: string;
      notes?: string;
      expiresAt?: string;
      reason?: string;
      password?: string;
    };

    if (body.action === "set_password") {
      const password = (body.password || "").trim();
      if (password.length < 4) {
        return NextResponse.json({ error: "password must be at least 4 characters" }, { status: 400 });
      }

      const setting = await setUsbDirectIssuePassword(password);

      await createAuditLog({
        action: "usb_license_password_updated",
        targetType: "UsbLicensePassword",
        targetId: "default",
        metadataJson: {
          adminId: admin.user.id,
          adminUsername: admin.user.username,
        },
      });

      return NextResponse.json({
        success: true,
        directIssue: {
          passwordConfigured: true,
          updatedAt: setting.updatedAt,
        },
      });
    }

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

      const existingLicenseByRequest = await prisma.usbLicense.findFirst({
        where: { requestId: requestRecord.id },
        orderBy: { createdAt: "desc" },
      });
      if (existingLicenseByRequest) {
        const updatedRequest = requestRecord.status === "APPROVED"
          ? requestRecord
          : await prisma.usbLicenseRequest.update({
              where: { id: requestRecord.id },
              data: {
                status: "APPROVED",
                customerName: existingLicenseByRequest.customerName ?? requestRecord.customerName,
                approvedAt: requestRecord.approvedAt ?? new Date(),
                rejectedAt: null,
                rejectionReason: null,
                licenseRecordId: existingLicenseByRequest.id,
              },
            });

        return NextResponse.json({
          success: true,
          duplicated: true,
          request: updatedRequest,
          license: existingLicenseByRequest,
        });
      }

      const expiresAt = parseOptionalIsoDate(body.expiresAt);
      const result = await prisma.$transaction((tx) =>
        issueUsbLicense(tx, {
          requestId: requestRecord.id,
          usbBindingId: requestRecord.usbBindingId,
          usbFingerprint: requestRecord.usbFingerprintJson,
          customerName: body.customerName ?? requestRecord.customerName,
          notes: body.notes,
          expiresAt,
          runtimeRootHint: requestRecord.runtimeRootHint,
          driveLetter: requestRecord.driveLetter,
          volumeLabel: requestRecord.volumeLabel,
          friendlyName: requestRecord.friendlyName,
          devicePlatform: requestRecord.devicePlatform,
          submitterName: requestRecord.submitterName,
          applicantNote: requestRecord.applicantNote,
        }),
      );

      await createAuditLog({
        action: "usb_license_approved",
        targetType: "UsbLicense",
        targetId: result.licenseRecord.id,
        metadataJson: {
          adminId: admin.user.id,
          adminUsername: admin.user.username,
          requestId: requestRecord.id,
          licenseId: result.licenseRecord.licenseId,
          usbBindingId: result.licenseRecord.usbBindingId,
        },
      });

      return NextResponse.json({
        success: true,
        duplicated: result.duplicated,
        request: result.requestRecord,
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
        action: "usb_license_rejected",
        targetType: "UsbLicenseRequest",
        targetId: requestId,
        metadataJson: {
          adminId: admin.user.id,
          adminUsername: admin.user.username,
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
        action: "usb_license_revoked",
        targetType: "UsbLicense",
        targetId: updatedLicense.id,
        metadataJson: {
          adminId: admin.user.id,
          adminUsername: admin.user.username,
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
