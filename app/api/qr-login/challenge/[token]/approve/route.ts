import { NextResponse } from "next/server";
import { QrLoginChallengeStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createAuditLog, requireAdmin } from "@/lib/admin";

export async function POST(_: Request, context: { params: Promise<{ token: string }> }) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { token } = await context.params;
  const challenge = await prisma.qrLoginChallenge.findUnique({
    where: { qrToken: token },
  });

  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  if (challenge.expiresAt.getTime() <= Date.now()) {
    const expired = await prisma.qrLoginChallenge.update({
      where: { id: challenge.id },
      data: { status: QrLoginChallengeStatus.EXPIRED },
    });

    return NextResponse.json({ challenge: expired, error: "Challenge expired" }, { status: 409 });
  }

  const approved = await prisma.qrLoginChallenge.update({
    where: { id: challenge.id },
    data: {
      status: QrLoginChallengeStatus.APPROVED,
      approvedAt: new Date(),
    },
  });

  await createAuditLog({
    userId: null,
    action: "qr_login_challenge.approved",
    targetType: "QrLoginChallenge",
    targetId: approved.id,
    metadataJson: {
      actor: {
        id: admin.user.id,
        email: admin.user.email,
        role: admin.user.role,
      },
      qrToken: approved.qrToken,
      status: approved.status,
    },
  });

  return NextResponse.json({ challenge: approved });
}
