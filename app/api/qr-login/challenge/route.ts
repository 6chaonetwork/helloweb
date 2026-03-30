import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildQrLoginUrl, getChallengeTtlSeconds } from "@/lib/qr-login";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";

export function OPTIONS(request: Request) {
  return buildCorsPreflightResponse(request.headers.get("origin"));
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const body = await request.json().catch(() => ({}));
  const ttlSeconds = typeof body.ttlSeconds === "number" && body.ttlSeconds > 0 ? body.ttlSeconds : getChallengeTtlSeconds();
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  const qrToken = randomUUID();
  const eventKey = `qrlogin:${qrToken}`;

  const challenge = await prisma.qrLoginChallenge.create({
    data: {
      qrToken,
      wechatEventKey: eventKey,
      expiresAt,
      deviceId: body.deviceId ?? null,
    },
  });

  return withCors(
    NextResponse.json({
      challenge: {
        id: challenge.id,
        qrToken: challenge.qrToken,
        eventKey,
        status: challenge.status,
        expiresAt: challenge.expiresAt,
        qrUrl: buildQrLoginUrl(challenge.qrToken),
      },
    }),
    origin,
  );
}
