import type { Prisma, PrismaClient, UsbLicenseRequest } from "@prisma/client";
import {
  createSignedUsbLicense,
  createSignedUsbLicensePolicy,
  normalizeUsbFingerprint,
  type UsbFingerprint,
} from "@/lib/usb-license";

type DbClient = PrismaClient | Prisma.TransactionClient;

type IssueUsbLicenseInput = {
  requestId?: string | null;
  usbBindingId: string;
  usbFingerprint: unknown;
  customerName?: string | null;
  notes?: string | null;
  expiresAt?: Date | null;
  runtimeRootHint?: string | null;
  driveLetter?: string | null;
  volumeLabel?: string | null;
  friendlyName?: string | null;
  devicePlatform?: string | null;
  submitterName?: string | null;
  applicantNote?: string | null;
};

export async function issueUsbLicense(db: DbClient, input: IssueUsbLicenseInput) {
  const usbFingerprint = normalizeUsbFingerprint(input.usbFingerprint);

  const existingActiveLicense = await db.usbLicense.findFirst({
    where: {
      usbBindingId: input.usbBindingId,
      status: "ACTIVE",
    },
    orderBy: { createdAt: "desc" },
  });

  if (existingActiveLicense) {
    const linkedRequest = existingActiveLicense.requestId
      ? await db.usbLicenseRequest.findUnique({ where: { id: existingActiveLicense.requestId } })
      : null;

    return {
      duplicated: true,
      licenseRecord: existingActiveLicense,
      requestRecord: linkedRequest,
      usbFingerprint,
    };
  }

  const requestRecord = await resolveRequestRecord(db, {
    requestId: input.requestId ?? null,
    usbBindingId: input.usbBindingId,
    usbFingerprint,
    runtimeRootHint: input.runtimeRootHint ?? null,
    driveLetter: input.driveLetter ?? null,
    volumeLabel: input.volumeLabel ?? null,
    friendlyName: input.friendlyName ?? usbFingerprint.friendlyName ?? null,
    devicePlatform: input.devicePlatform ?? null,
    customerName: input.customerName ?? null,
    submitterName: input.submitterName ?? null,
    applicantNote: input.applicantNote ?? input.notes ?? null,
  });

  const signedLicense = createSignedUsbLicense({
    usbBindingId: input.usbBindingId,
    usbFingerprint,
    customerName: input.customerName ?? requestRecord.customerName,
    notes: input.notes ?? requestRecord.applicantNote,
    expiresAt: input.expiresAt?.toISOString() ?? null,
  });
  const signedPolicy = createSignedUsbLicensePolicy({
    licenseId: signedLicense.licenseId,
    usbBindingId: input.usbBindingId,
    status: "active",
  });

  const replaceableLicenses = await db.usbLicense.findMany({
    where: {
      usbBindingId: input.usbBindingId,
      status: "ACTIVE",
    },
  });

  for (const existing of replaceableLicenses) {
    await db.usbLicense.update({
      where: { id: existing.id },
      data: {
        status: "REPLACED",
        revokedReason: `Replaced by ${signedLicense.licenseId}`,
        policyVersion: existing.policyVersion + 1,
        signedPolicyJson: createSignedUsbLicensePolicy({
          licenseId: existing.licenseId,
          usbBindingId: existing.usbBindingId,
          status: "replaced",
          reason: `Replaced by ${signedLicense.licenseId}`,
        }) satisfies Prisma.InputJsonValue,
      },
    });
  }

  const licenseRecord = await db.usbLicense.create({
    data: {
      licenseId: signedLicense.licenseId,
      requestId: requestRecord.id,
      usbBindingId: input.usbBindingId,
      status: "ACTIVE",
      customerName: signedLicense.customerName || null,
      notes: signedLicense.notes || null,
      issuedAt: new Date(signedLicense.issuedAt),
      expiresAt: signedLicense.expiresAt ? new Date(signedLicense.expiresAt) : null,
      policyVersion: 1,
      usbFingerprintJson: usbFingerprint satisfies Prisma.InputJsonValue,
      signedLicenseJson: signedLicense satisfies Prisma.InputJsonValue,
      signedPolicyJson: signedPolicy satisfies Prisma.InputJsonValue,
    },
  });

  const updatedRequest = await db.usbLicenseRequest.update({
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

  return {
    duplicated: false,
    licenseRecord,
    requestRecord: updatedRequest,
    usbFingerprint,
  };
}

async function resolveRequestRecord(
  db: DbClient,
  input: {
    requestId: string | null;
    usbBindingId: string;
    usbFingerprint: UsbFingerprint;
    runtimeRootHint: string | null;
    driveLetter: string | null;
    volumeLabel: string | null;
    friendlyName: string | null;
    devicePlatform: string | null;
    customerName: string | null;
    submitterName: string | null;
    applicantNote: string | null;
  },
): Promise<UsbLicenseRequest> {
  if (input.requestId) {
    const existing = await db.usbLicenseRequest.findUnique({ where: { id: input.requestId } });
    if (existing) {
      return existing;
    }
  }

  const latestPending = await db.usbLicenseRequest.findFirst({
    where: {
      usbBindingId: input.usbBindingId,
      licenseRecordId: null,
    },
    orderBy: { updatedAt: "desc" },
  });

  if (latestPending) {
    return await db.usbLicenseRequest.update({
      where: { id: latestPending.id },
      data: {
        usbFingerprintJson: input.usbFingerprint satisfies Prisma.InputJsonValue,
        runtimeRootHint: input.runtimeRootHint,
        driveLetter: input.driveLetter,
        volumeLabel: input.volumeLabel,
        friendlyName: input.friendlyName,
        devicePlatform: input.devicePlatform,
        customerName: input.customerName,
        submitterName: input.submitterName,
        applicantNote: input.applicantNote,
        lastSubmittedAt: new Date(),
      },
    });
  }

  return await db.usbLicenseRequest.create({
    data: {
      usbBindingId: input.usbBindingId,
      usbFingerprintJson: input.usbFingerprint satisfies Prisma.InputJsonValue,
      runtimeRootHint: input.runtimeRootHint,
      driveLetter: input.driveLetter,
      volumeLabel: input.volumeLabel,
      friendlyName: input.friendlyName,
      devicePlatform: input.devicePlatform,
      customerName: input.customerName,
      submitterName: input.submitterName,
      applicantNote: input.applicantNote,
      status: "PENDING",
    },
  });
}
