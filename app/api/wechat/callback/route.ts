import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { QrLoginChallengeStatus, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  buildWechatCallbackSignature,
  decryptWechatMessage,
  encryptWechatMessage,
  verifyWechatEncryptedSignature,
} from "@/lib/wechat-crypto";
import { getWechatAccessToken, getWechatUserProfile } from "@/lib/wechat";
import { extractXmlValue, parseWechatXml } from "@/lib/wechat-xml";

const DEFAULT_CHANNEL_TYPE = "WECHAT_OFFICIAL_ACCOUNT";

async function getChannelConfig() {
  return prisma.channelConfig.findUnique({
    where: { channelType: DEFAULT_CHANNEL_TYPE },
  });
}

function buildSignature(token: string, timestamp: string, nonce: string) {
  return createHash("sha1").update([token, timestamp, nonce].sort().join("")).digest("hex");
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
  profile?: {
    nickname?: string | null;
    avatarUrl?: string | null;
    unionId?: string | null;
    sex?: number | null;
    language?: string | null;
    city?: string | null;
    province?: string | null;
    country?: string | null;
  } | null;
  profileSync?: {
    status?: string | null;
    error?: string | null;
    syncedAt?: Date | null;
  } | null;
}) {
  const now = new Date();
  const existing = await prisma.user.findUnique({
    where: { wechatOpenId: input.openId },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        name: input.profile?.nickname || existing.name,
        avatarUrl: input.profile?.avatarUrl || existing.avatarUrl,
        wechatUnionId: input.profile?.unionId || existing.wechatUnionId,
        wechatFollowed: input.isFollowing ? true : existing.wechatFollowed,
        wechatFollowedAt: input.isFollowing ? existing.wechatFollowedAt || now : existing.wechatFollowedAt,
        wechatNickname: input.profile?.nickname || existing.wechatNickname,
        wechatAvatarUrl: input.profile?.avatarUrl || existing.wechatAvatarUrl,
        wechatSex: input.profile?.sex ?? existing.wechatSex,
        wechatLanguage: input.profile?.language || existing.wechatLanguage,
        wechatCity: input.profile?.city || existing.wechatCity,
        wechatProvince: input.profile?.province || existing.wechatProvince,
        wechatCountry: input.profile?.country || existing.wechatCountry,
        wechatProfileSyncStatus: input.profileSync?.status ?? existing.wechatProfileSyncStatus,
        wechatProfileSyncError: input.profileSync?.error ?? existing.wechatProfileSyncError,
        wechatProfileSyncedAt: input.profileSync?.syncedAt ?? existing.wechatProfileSyncedAt,
        lastWechatEvent: input.event,
        lastWechatEventAt: now,
      },
    });
  }

  return prisma.user.create({
    data: {
      email: buildPlaceholderEmail(input.openId),
      name: input.profile?.nickname || `微信用户-${input.openId.slice(-6)}`,
      avatarUrl: input.profile?.avatarUrl || null,
      wechatOpenId: input.openId,
      wechatUnionId: input.profile?.unionId || null,
      wechatFollowed: input.isFollowing,
      wechatFollowedAt: input.isFollowing ? now : null,
      wechatNickname: input.profile?.nickname || null,
      wechatAvatarUrl: input.profile?.avatarUrl || null,
      wechatSex: input.profile?.sex ?? null,
      wechatLanguage: input.profile?.language || null,
      wechatCity: input.profile?.city || null,
      wechatProvince: input.profile?.province || null,
      wechatCountry: input.profile?.country || null,
      wechatProfileSyncStatus: input.profileSync?.status ?? null,
      wechatProfileSyncError: input.profileSync?.error ?? null,
      wechatProfileSyncedAt: input.profileSync?.syncedAt ?? null,
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
  const channelConfig = await getChannelConfig();

  let profile: {
    nickname?: string | null;
    avatarUrl?: string | null;
    unionId?: string | null;
    sex?: number | null;
    language?: string | null;
    city?: string | null;
    province?: string | null;
    country?: string | null;
  } | null = null;
  let profileSync: {
    status?: string | null;
    error?: string | null;
    syncedAt?: Date | null;
  } | null = null;

  if (
    openId
    && (isSubscribe || isScan)
    && channelConfig?.enabled
    && channelConfig.appId
    && channelConfig.appSecretEncrypted
  ) {
    try {
      const accessToken = await getWechatAccessToken(channelConfig);
      profile = await getWechatUserProfile({
        accessToken,
        openId,
      });
      const missingFields: string[] = [];
      if (!profile.nickname) missingFields.push("nickname");
      if (!profile.avatarUrl) missingFields.push("avatarUrl");
      profileSync = {
        status: missingFields.length > 0 ? "partial" : "success",
        error: missingFields.length > 0 ? `missing_fields:${missingFields.join(",")}` : null,
        syncedAt: now,
      };
    } catch (error) {
      const syncError = error instanceof Error ? error.message : "wechat_profile_sync_failed";
      profile = null;
      profileSync = {
        status: "failed",
        error: syncError,
        syncedAt: now,
      };
    }
  } else if (openId && (isSubscribe || isScan)) {
    profileSync = {
      status: channelConfig?.enabled ? "skipped_missing_credentials" : "skipped_channel_disabled",
      error: channelConfig?.enabled ? "missing_app_credentials" : "channel_disabled",
      syncedAt: now,
    };
  }

  let userId: string | null = challenge.userId;
  if (openId) {
    const user = await upsertWechatUser({
      openId,
      isFollowing: isSubscribe || isScan,
      event: input.event || null,
      profile,
      profileSync,
    });
    userId = user.id;

    if (profileSync?.status === "failed" || profileSync?.status === "partial") {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: profileSync.status === "partial" ? "wechat_profile_sync.partial" : "wechat_profile_sync.failed",
          targetType: "User",
          targetId: user.id,
          metadataJson: {
            openId,
            error: profileSync.error,
            event: input.event,
          },
        },
      });
    }
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
  const msgSignature = searchParams.get("msg_signature") || "";
  const timestamp = searchParams.get("timestamp") || "";
  const nonce = searchParams.get("nonce") || "";
  const echostr = searchParams.get("echostr") || "";
  const encryptType = searchParams.get("encrypt_type") || "";

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
    if (encryptType !== "aes") {
      return new NextResponse("Invalid signature", { status: 401 });
    }
  }

  if (encryptType === "aes") {
    if (!config?.encodingAesKeyEncrypted || !config?.appId) {
      return new NextResponse("Missing EncodingAESKey or AppID", { status: 500 });
    }

    if (!verifyWechatEncryptedSignature({
      token: verifyToken,
      timestamp,
      nonce,
      encrypted: echostr,
      msgSignature,
    })) {
      return new NextResponse("Invalid encrypted signature", { status: 401 });
    }

    const decrypted = decryptWechatMessage({
      encrypted: echostr,
      encodingAesKey: config.encodingAesKeyEncrypted,
      appId: config.appId,
    });

    return new NextResponse(decrypted.xml, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  return new NextResponse(echostr, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const timestamp = searchParams.get("timestamp") || "";
  const nonce = searchParams.get("nonce") || "";
  const msgSignature = searchParams.get("msg_signature") || "";
  const body = await request.text();
  const config = await getChannelConfig();
  const verifyToken = config?.verifyToken || process.env.WECHAT_VERIFY_TOKEN || null;

  let parsedXml = body;
  let encrypted = false;
  let decryptError: string | null = null;
  const encryptedPayload = extractXmlValue(body, "Encrypt");

  if (encryptedPayload) {
    encrypted = true;
    if (!verifyToken || !config?.encodingAesKeyEncrypted || !config?.appId) {
      decryptError = "Missing encrypted callback config";
    } else if (!verifyWechatEncryptedSignature({
      token: verifyToken,
      timestamp,
      nonce,
      encrypted: encryptedPayload,
      msgSignature,
    })) {
      decryptError = "Invalid encrypted callback signature";
    } else {
      try {
        parsedXml = decryptWechatMessage({
          encrypted: encryptedPayload,
          encodingAesKey: config.encodingAesKeyEncrypted,
          appId: config.appId,
        }).xml;
      } catch (error) {
        decryptError = error instanceof Error ? error.message : "Failed to decrypt callback";
      }
    }
  }

  const parsed = parseWechatXml(parsedXml);
  const challengeToken = extractChallengeToken(parsed.eventKey, parsed.content);

  let result: { ok: boolean; reason?: string } | null = null;
  if (!decryptError && challengeToken) {
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
        encrypted,
        decryptError,
        result,
      },
    },
  });

  if (encrypted && config?.encodingAesKeyEncrypted && config?.appId && verifyToken) {
    const encryptedResponse = encryptWechatMessage({
      plainText: "success",
      encodingAesKey: config.encodingAesKeyEncrypted,
      appId: config.appId,
    });
    const responseTimestamp = String(Math.floor(Date.now() / 1000));
    const responseNonce = nonce || `${Date.now()}`;
    const responseSignature = buildWechatCallbackSignature([
      verifyToken,
      responseTimestamp,
      responseNonce,
      encryptedResponse,
    ]);

    return new NextResponse(
      `<xml><Encrypt><![CDATA[${encryptedResponse}]]></Encrypt><MsgSignature><![CDATA[${responseSignature}]]></MsgSignature><TimeStamp>${responseTimestamp}</TimeStamp><Nonce><![CDATA[${responseNonce}]]></Nonce></xml>`,
      {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
      },
    );
  }

  return new NextResponse("success", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
