import { NextResponse } from "next/server";
import { QrLoginChallengeStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { buildQrLoginUrl } from "@/lib/qr-login";

function normalizeStatus(challenge: { status: QrLoginChallengeStatus; expiresAt: Date }) {
  if (challenge.status === QrLoginChallengeStatus.PENDING && challenge.expiresAt.getTime() <= Date.now()) {
    return QrLoginChallengeStatus.EXPIRED;
  }

  return challenge.status;
}

export async function GET(_: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;

  const challenge = await prisma.qrLoginChallenge.findUnique({
    where: { qrToken: token },
  });

  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  const normalizedStatus = normalizeStatus(challenge);

  if (normalizedStatus !== challenge.status) {
    await prisma.qrLoginChallenge.update({
      where: { id: challenge.id },
      data: { status: normalizedStatus },
    });
  }

  return NextResponse.json({
    challenge: {
      id: challenge.id,
      qrToken: challenge.qrToken,
      status: normalizedStatus,
      expiresAt: challenge.expiresAt,
      approvedAt: challenge.approvedAt,
      consumedAt: challenge.consumedAt,
      qrUrl: buildQrLoginUrl(challenge.qrToken),
    },
  });
}
