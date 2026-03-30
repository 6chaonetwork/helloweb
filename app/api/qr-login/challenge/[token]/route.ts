import { NextResponse } from "next/server";
import { QrLoginChallengeStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { buildQrLoginUrl } from "@/lib/qr-login";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";

function normalizeStatus(challenge: { status: QrLoginChallengeStatus; expiresAt: Date }) {
  if (challenge.status === QrLoginChallengeStatus.PENDING && challenge.expiresAt.getTime() <= Date.now()) {
    return QrLoginChallengeStatus.EXPIRED;
  }

  return challenge.status;
}

export function OPTIONS(request: Request) {
  return buildCorsPreflightResponse(request.headers.get("origin"));
}

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  const origin = request.headers.get("origin");
  const { token } = await context.params;

  const challenge = await prisma.qrLoginChallenge.findUnique({
    where: { qrToken: token },
  });

  if (!challenge) {
    return withCors(NextResponse.json({ error: "Challenge not found" }, { status: 404 }), origin);
  }

  const normalizedStatus = normalizeStatus(challenge);

  if (normalizedStatus !== challenge.status) {
    await prisma.qrLoginChallenge.update({
      where: { id: challenge.id },
      data: { status: normalizedStatus },
    });
  }

  return withCors(
    NextResponse.json({
      challenge: {
        id: challenge.id,
        qrToken: challenge.qrToken,
        status: normalizedStatus,
        expiresAt: challenge.expiresAt,
        approvedAt: challenge.approvedAt,
        consumedAt: challenge.consumedAt,
        qrUrl: buildQrLoginUrl(challenge.qrToken),
      },
    }),
    origin,
  );
}
