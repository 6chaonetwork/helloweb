import { NextResponse } from "next/server";
import { QrLoginChallengeStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { buildQrLoginUrl } from "@/lib/qr-login";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";

function normalizeStatus(challenge: { status: QrLoginChallengeStatus; expiresAt: Date }) {
  if (
    [QrLoginChallengeStatus.PENDING, QrLoginChallengeStatus.SCANNED, QrLoginChallengeStatus.FOLLOWED].includes(challenge.status) &&
    challenge.expiresAt.getTime() <= Date.now()
  ) {
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

  const persistedFallbackQrUrl = challenge.fallbackQrUrl || buildQrLoginUrl(challenge.qrToken);

  if (normalizedStatus !== challenge.status || !challenge.fallbackQrUrl) {
    await prisma.qrLoginChallenge.update({
      where: { id: challenge.id },
      data: {
        status: normalizedStatus,
        fallbackQrUrl: challenge.fallbackQrUrl ? undefined : persistedFallbackQrUrl,
      },
    });
  }

  return withCors(
    NextResponse.json({
      challenge: {
        id: challenge.id,
        qrToken: challenge.qrToken,
        eventKey: challenge.wechatEventKey,
        status: normalizedStatus,
        expiresAt: challenge.expiresAt,
        approvedAt: challenge.approvedAt,
        consumedAt: challenge.consumedAt,
        scannedAt: challenge.scannedAt,
        followedAt: challenge.followedAt,
        wechatOpenId: challenge.wechatOpenId,
        lastWechatEvent: challenge.lastWechatEvent,
        lastWechatEventAt: challenge.lastWechatEventAt,
        qrUrl: challenge.qrUrl || persistedFallbackQrUrl,
        qrTicket: challenge.qrTicket,
        qrSource: challenge.qrSource || "fallback",
        fallbackQrUrl: persistedFallbackQrUrl,
        qrCreateError: challenge.qrCreateError,
      },
    }),
    origin,
  );
}
