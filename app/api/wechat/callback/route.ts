import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { QrLoginChallengeStatus, UserStatus } from "@prisma/client";
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

function buildPlaceholderEmail(openId: string) {
  return `${openId}@wechat.local`;
}

async function upsertWechatUser(input: {
  openId: string;
  isFollowing: boolean;
  event: string | null;
}) {
  const now = new Date();
  const existing = await prisma.user.findUnique({
    where: { wechatOpenId: input.openId },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        wechatFollowed: input.isFollowing ? true : existing.wechatFollowed,
        wechatFollowedAt: input.isFollowing ? existing.wechatFollowedAt || now : existing.wechatFollowedAt,
        lastWechatEvent: input.event,
        lastWechatEventAt: now,
      },
    });
  }

  return prisma.user.create({
    data: {
      email: buildPlaceholderEmail(input.openId),
      name: `微信用户-${input.openId.slice(-6)}`,
      wechatOpenId: input.openId,
      wechatFollowed: input.isFollowing,
      wechatFollowedAt: input.isFollowing ? now : null,
      lastWechatEvent: input.event,
      lastWechatEventAt: now,
      status: UserStatus.ACTIVE,
    },
  });
}

async function processChallengeEvent(input: {
  token: string;
  openId?: string | null;
  event?: string | null;
  eventKey?: string | null;
}) {
  const challenge = await prisma.qrLoginChallenge.findUnique({
    where: { qrToken: input.token },
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

  const normalizedEvent = (input.event || "").toLowerCase();
  const isSubscribe = normalizedEvent === "subscribe";
  const isScan = normalizedEvent === "scan";
  const openId = input.openId || null;
  const now = new Date();

  let userId: string | null = challenge.userId;
  if (openId) {
    const user = await upsertWechatUser({
      openId,
      isFollowing: isSubscribe || isScan,
      event: input.event || null,
    });
    userId = user.id;
  }

  let nextStatus = challenge.status;
  if (isSubscribe) {
    nextStatus = QrLoginChallengeStatus.FOLLOWED;
  } else if (isScan) {
    nextStatus = QrLoginChallengeStatus.SCANNED;
  }

  const intermediate = await prisma.qrLoginChallenge.update({
    where: { id: challenge.id },
    data: {
      userId,
      status: nextStatus,
      wechatOpenId: openId ?? challenge.wechatOpenId,
      wechatEventKey: input.eventKey ?? challenge.wechatEventKey,
      lastWechatEvent: input.event ?? challenge.lastWechatEvent,
      lastWechatEventAt: now,
      scannedAt: isScan || isSubscribe ? challenge.scannedAt || now : challenge.scannedAt,
      followedAt: isSubscribe ? challenge.followedAt || now : challenge.followedAt,
    },
  });

  const approved = await prisma.qrLoginChallenge.update({
    where: { id: challenge.id },
    data: {
      status: QrLoginChallengeStatus.APPROVED,
      approvedAt: challenge.approvedAt || now,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: userId ?? null,
      action: "wechat_callback.challenge_approved",
      targetType: "QrLoginChallenge",
      targetId: approved.id,
      metadataJson: {
        qrToken: approved.qrToken,
        wechatOpenId: approved.wechatOpenId,
        wechatEventKey: approved.wechatEventKey,
        event: input.event,
        intermediateStatus: intermediate.status,
        finalStatus: approved.status,
      },
    },
  });

  return { ok: true as const, challenge: approved };
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
    result = await processChallengeEvent({
      token: challengeToken,
      openId: parsed.fromUserName,
      event: parsed.event,
      eventKey: parsed.eventKey,
    });
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
