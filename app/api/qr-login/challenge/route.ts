import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildQrLoginUrl, getChallengeExpireSeconds, getChallengeTtlSeconds } from "@/lib/qr-login";
import { createWechatParamQrCode, getWechatAccessToken } from "@/lib/wechat";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";

const DEFAULT_CHANNEL_TYPE = "WECHAT_OFFICIAL_ACCOUNT";

async function getChannelConfig() {
  return prisma.channelConfig.findUnique({
    where: { channelType: DEFAULT_CHANNEL_TYPE },
  });
}

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
  const fallbackQrUrl = buildQrLoginUrl(qrToken);

  const challenge = await prisma.qrLoginChallenge.create({
    data: {
      qrToken,
      wechatEventKey: eventKey,
      expiresAt,
      deviceId: body.deviceId ?? null,
    },
  });

  const channelConfig = await getChannelConfig();
  let qrUrl = fallbackQrUrl;
  let qrTicket: string | null = null;
  let qrSource: "wechat" | "fallback" = "fallback";
  let qrCreateError: string | null = null;

  if (channelConfig?.enabled && channelConfig.appId && channelConfig.appSecretEncrypted) {
    try {
      const accessToken = await getWechatAccessToken(channelConfig);
      const wechatQr = await createWechatParamQrCode({
        accessToken,
        eventKey,
        expireSeconds: getChallengeExpireSeconds(ttlSeconds),
      });

      qrUrl = wechatQr.qrUrl;
      qrTicket = wechatQr.ticket;
      qrSource = "wechat";
    } catch (error) {
      qrCreateError = error instanceof Error ? error.message : "Failed to create WeChat QR code";

      await prisma.auditLog.create({
        data: {
          userId: null,
          action: "qr_login_challenge.wechat_qr_create_failed",
          targetType: "QrLoginChallenge",
          targetId: challenge.id,
          metadataJson: {
            qrToken: challenge.qrToken,
            eventKey,
            error: qrCreateError,
          },
        },
      });
    }
  }

  return withCors(
    NextResponse.json({
      challenge: {
        id: challenge.id,
        qrToken: challenge.qrToken,
        eventKey,
        status: challenge.status,
        expiresAt: challenge.expiresAt,
        qrUrl,
        qrTicket,
        qrSource,
        fallbackQrUrl,
        qrCreateError,
      },
    }),
    origin,
  );
}
