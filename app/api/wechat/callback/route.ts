import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { QrLoginChallengeStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { parseWechatXml } from "@/lib/wechat-xml";

const DEFAULT_CHANNEL_TYPE = "WECHAT_OFFICIAL_ACCOUNT";

async function getChannelConfig() {
  return prisma.channelConfig.findUnique({
    where: { channelType: DEFAULT_CHANNEL_TYPE },
  });
}

function buildSignature(token: string, timestamp: string, nonce: string) {
  return createHash("sha1")
    .update([token, timestamp, nonce].sort().join(""))
    .digest("hex");
}

function extractChallengeToken(eventKey?: string | null, content?: string | null) {
  const raw = (eventKey || content || "").trim();
  if (!raw) return null;

  if (raw.startsWith("qrlogin:")) {
    return raw.slice("qrlogin:".length);
  }

  if (raw.startsWith("qrscene_qrlogin:")) {
    return raw.slice("qrscene_qrlogin:".length);
  }

  return null;
}

async function approveChallengeByToken(token: string, openId?: string | null, eventKey?: string | null) {
  const challenge = await prisma.qrLoginChallenge.findUnique({
    where: { qrToken: token },
  });

  if (!challenge) {
    return { ok: false as const, reason: "challenge_not_found" };
  }

  if (challenge.expiresAt.getTime() <= Date.now()) {
    await prisma.qrLoginChallenge.update({
      where: { id: challenge.id },
      data: { status: QrLoginChallengeStatus.EXPIRED },
    });

    return { ok: false as const, reason: "challenge_expired" };
  }

  const updated = await prisma.qrLoginChallenge.update({
    where: { id: challenge.id },
    data: {
      status: QrLoginChallengeStatus.APPROVED,
      approvedAt: new Date(),
      wechatOpenId: openId ?? challenge.wechatOpenId,
      wechatEventKey: eventKey ?? challenge.wechatEventKey,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: null,
      action: "wechat_callback.challenge_approved",
      targetType: "QrLoginChallenge",
      targetId: updated.id,
      metadataJson: {
        qrToken: updated.qrToken,
        wechatOpenId: updated.wechatOpenId,
        wechatEventKey: updated.wechatEventKey,
      },
    },
  });

  return { ok: true as const, challenge: updated };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const signature = searchParams.get("signature") || "";
  const timestamp = searchParams.get("timestamp") || "";
  const nonce = searchParams.get("nonce") || "";
  const echostr = searchParams.get("echostr") || "";

  const config = await getChannelConfig();
  const verifyToken = config?.verifyToken || process.env.WECHAT_VERIFY_TOKEN || null;
  if (!verifyToken) {
    return new NextResponse("Missing verify token", { status: 500 });
  }

  if (!signature || !timestamp || !nonce || !echostr) {
    return new NextResponse("Missing required query params", { status: 400 });
  }

  const expectedSignature = buildSignature(verifyToken, timestamp, nonce);
  if (expectedSignature !== signature) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  return new NextResponse(echostr, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const parsed = parseWechatXml(body);
  const challengeToken = extractChallengeToken(parsed.eventKey, parsed.content);

  let result: { ok: boolean; reason?: string } | null = null;
  if (challengeToken) {
    result = await approveChallengeByToken(challengeToken, parsed.fromUserName, parsed.eventKey);
  }

  await prisma.auditLog.create({
    data: {
      userId: null,
      action: "wechat_callback.received",
      targetType: "ChannelConfig",
      metadataJson: {
        msgType: parsed.msgType,
        event: parsed.event,
        eventKey: parsed.eventKey,
        fromUserName: parsed.fromUserName,
        content: parsed.content,
        challengeToken,
        result,
      },
    },
  });

  return new NextResponse("success", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
