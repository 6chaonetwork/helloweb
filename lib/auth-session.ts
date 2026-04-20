import { createHash, randomBytes } from "crypto";
import { DeviceStatus, QrLoginChallengeStatus, UserStatus } from "@prisma/client";
import { createAuditLog } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { ensureUserDisplayIdentity, resolveUserVisibleName } from "@/lib/user-identity";

const ACCESS_TOKEN_TTL_SECONDS = Number(process.env.AUTH_ACCESS_TOKEN_TTL_SECONDS || 60 * 60 * 2);
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.AUTH_REFRESH_TOKEN_TTL_DAYS || 30);

function getAccessTokenTtlSeconds() {
  if (!Number.isFinite(ACCESS_TOKEN_TTL_SECONDS) || ACCESS_TOKEN_TTL_SECONDS <= 0) {
    return 60 * 60 * 2;
  }
  return Math.max(300, Math.floor(ACCESS_TOKEN_TTL_SECONDS));
}

function getRefreshTokenTtlDays() {
  if (!Number.isFinite(REFRESH_TOKEN_TTL_DAYS) || REFRESH_TOKEN_TTL_DAYS <= 0) {
    return 30;
  }
  return Math.max(1, Math.floor(REFRESH_TOKEN_TTL_DAYS));
}

function issueOpaqueToken(prefix: "at" | "rt") {
  return `${prefix}_${randomBytes(32).toString("base64url")}`;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function nowPlusSeconds(seconds: number) {
  return new Date(Date.now() + seconds * 1000);
}

function nowPlusDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function parseBearerToken(headerValue?: string | null) {
  const raw = (headerValue || "").trim();
  if (!raw.toLowerCase().startsWith("bearer ")) return null;
  const token = raw.slice(7).trim();
  return token || null;
}

export function buildPublicUser(user: {
  id: string;
  email: string;
  name: string | null;
  displayName?: string | null;
  publicUserId?: string | null;
  remarkName?: string | null;
  avatarUrl: string | null;
  firstLoginAt?: Date | null;
  lastLoginAt?: Date | null;
  lastLoginIp?: string | null;
  role: string;
  status: string;
  wechatOpenId: string | null;
  wechatFollowed: boolean;
  wechatNickname: string | null;
  wechatAvatarUrl: string | null;
  wechatSex?: number | null;
  wechatLanguage?: string | null;
  wechatCity?: string | null;
  wechatProvince?: string | null;
  wechatCountry?: string | null;
  wechatProfileSyncStatus?: string | null;
  wechatProfileSyncError?: string | null;
  wechatProfileSyncedAt?: Date | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: resolveUserVisibleName(user),
    displayName: user.displayName ?? null,
    publicUserId: user.publicUserId ?? null,
    remarkName: user.remarkName ?? null,
    avatarUrl: user.wechatAvatarUrl || user.avatarUrl || null,
    firstLoginAt: user.firstLoginAt ?? null,
    lastLoginAt: user.lastLoginAt ?? null,
    lastLoginIp: user.lastLoginIp ?? null,
    role: user.role,
    status: user.status,
    wechatBound: Boolean(user.wechatOpenId),
    wechatFollowed: user.wechatFollowed,
    wechatNickname: user.wechatNickname,
    wechatAvatarUrl: user.wechatAvatarUrl,
    wechatSex: user.wechatSex ?? null,
    wechatLanguage: user.wechatLanguage ?? null,
    wechatCity: user.wechatCity ?? null,
    wechatProvince: user.wechatProvince ?? null,
    wechatCountry: user.wechatCountry ?? null,
    wechatProfileSyncStatus: user.wechatProfileSyncStatus ?? null,
    wechatProfileSyncError: user.wechatProfileSyncError ?? null,
    wechatProfileSyncedAt: user.wechatProfileSyncedAt ?? null,
  };
}

export function buildPublicDevice(device?: {
  id: string;
  clientDeviceId: string | null;
  deviceName: string;
  deviceType: string | null;
  platform: string | null;
  clientVersion: string | null;
  status: string;
  lastSeenAt: Date | null;
} | null) {
  if (!device) return null;

  return {
    id: device.id,
    clientDeviceId: device.clientDeviceId,
    deviceName: device.deviceName,
    deviceType: device.deviceType,
    platform: device.platform,
    clientVersion: device.clientVersion,
    status: device.status,
    lastSeenAt: device.lastSeenAt,
  };
}

function buildPublicSession(session: {
  id: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  lastSeenAt: Date | null;
}) {
  return {
    id: session.id,
    accessTokenExpiresAt: session.accessTokenExpiresAt,
    refreshTokenExpiresAt: session.refreshTokenExpiresAt,
    lastSeenAt: session.lastSeenAt,
  };
}

async function resolveOrCreateDevice(input: {
  userId: string;
  clientDeviceId?: string | null;
  deviceName?: string | null;
  deviceType?: string | null;
  platform?: string | null;
  clientVersion?: string | null;
}) {
  const clientDeviceId = input.clientDeviceId?.trim() || null;
  if (!clientDeviceId) {
    return null;
  }

  const now = new Date();
  const deviceName = input.deviceName?.trim() || "HelloClaw Desktop";
  const existing = await prisma.device.findFirst({
    where: { clientDeviceId },
  });

  if (existing) {
    return prisma.device.update({
      where: { id: existing.id },
      data: {
        userId: input.userId,
        deviceName,
        deviceType: input.deviceType ?? existing.deviceType,
        platform: input.platform ?? existing.platform,
        clientVersion: input.clientVersion ?? existing.clientVersion,
        status: DeviceStatus.ACTIVE,
        lastSeenAt: now,
      },
    });
  }

  return prisma.device.create({
    data: {
      userId: input.userId,
      clientDeviceId,
      deviceName,
      deviceType: input.deviceType ?? "desktop",
      platform: input.platform ?? null,
      clientVersion: input.clientVersion ?? null,
      status: DeviceStatus.ACTIVE,
      lastSeenAt: now,
    },
  });
}

async function createAuthSession(input: { userId: string; deviceId?: string | null }) {
  const accessToken = issueOpaqueToken("at");
  const refreshToken = issueOpaqueToken("rt");
  const accessTokenExpiresAt = nowPlusSeconds(getAccessTokenTtlSeconds());
  const refreshTokenExpiresAt = nowPlusDays(getRefreshTokenTtlDays());

  const session = await prisma.authSession.create({
    data: {
      userId: input.userId,
      deviceId: input.deviceId ?? null,
      accessTokenHash: hashToken(accessToken),
      refreshTokenHash: hashToken(refreshToken),
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      lastSeenAt: new Date(),
    },
  });

  return {
    session,
    accessToken,
    refreshToken,
    expiresIn: getAccessTokenTtlSeconds(),
  };
}

export async function consumeApprovedQrChallenge(input: {
  qrToken: string;
  clientDeviceId?: string | null;
  deviceName?: string | null;
  deviceType?: string | null;
  platform?: string | null;
  clientVersion?: string | null;
  loginIp?: string | null;
}) {
  const challenge = await prisma.qrLoginChallenge.findUnique({
    where: { qrToken: input.qrToken },
    include: {
      user: true,
      device: true,
    },
  });

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  if (challenge.expiresAt.getTime() <= Date.now()) {
    await prisma.qrLoginChallenge.update({
      where: { id: challenge.id },
      data: { status: QrLoginChallengeStatus.EXPIRED },
    });
    throw new Error("Challenge expired");
  }

  if (challenge.status === QrLoginChallengeStatus.CONSUMED) {
    throw new Error("Challenge already consumed");
  }

  if (challenge.status !== QrLoginChallengeStatus.APPROVED) {
    throw new Error("Challenge not approved yet");
  }

  const user = challenge.user ?? (challenge.userId
    ? await prisma.user.findUnique({ where: { id: challenge.userId } })
    : null);

  if (!user) {
    throw new Error("Approved challenge has no linked user");
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new Error("User unavailable");
  }

  const loginNow = new Date();
  const persistedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      firstLoginAt: user.firstLoginAt ?? loginNow,
      lastLoginAt: loginNow,
      lastLoginIp: input.loginIp?.trim() || user.lastLoginIp || null,
    },
  });
  const identityUser = await ensureUserDisplayIdentity(persistedUser.id);

  const device = await resolveOrCreateDevice({
    userId: identityUser.id,
    clientDeviceId: input.clientDeviceId ?? challenge.clientDeviceId,
    deviceName: input.deviceName ?? challenge.device?.deviceName ?? null,
    deviceType: input.deviceType ?? challenge.device?.deviceType ?? null,
    platform: input.platform ?? challenge.device?.platform ?? null,
    clientVersion: input.clientVersion ?? challenge.device?.clientVersion ?? null,
  });

  const issued = await createAuthSession({
    userId: identityUser.id,
    deviceId: device?.id ?? challenge.deviceId ?? null,
  });

  await prisma.qrLoginChallenge.update({
    where: { id: challenge.id },
    data: {
      userId: identityUser.id,
      deviceId: device?.id ?? challenge.deviceId ?? null,
      clientDeviceId: input.clientDeviceId ?? challenge.clientDeviceId,
      status: QrLoginChallengeStatus.CONSUMED,
      consumedAt: challenge.consumedAt || new Date(),
    },
  });

  await createAuditLog({
    userId: identityUser.id,
    action: "qr_login_challenge.consumed_by_desktop",
    targetType: "QrLoginChallenge",
    targetId: challenge.id,
    metadataJson: {
      qrToken: challenge.qrToken,
      deviceId: device?.id ?? null,
      clientDeviceId: input.clientDeviceId ?? challenge.clientDeviceId ?? null,
      authSessionId: issued.session.id,
    },
  });

  return {
    success: true,
    accessToken: issued.accessToken,
    refreshToken: issued.refreshToken,
    expiresIn: issued.expiresIn,
    session: buildPublicSession(issued.session),
    user: buildPublicUser(identityUser),
    device: buildPublicDevice(device),
  };
}

export async function getAuthContextFromAccessToken(accessToken: string) {
  const token = accessToken.trim();
  if (!token) return null;

  const authSession = await prisma.authSession.findUnique({
    where: { accessTokenHash: hashToken(token) },
    include: {
      user: true,
      device: true,
    },
  });

  if (!authSession || authSession.revokedAt) {
    return null;
  }

  if (authSession.accessTokenExpiresAt.getTime() <= Date.now()) {
    return null;
  }

  if (!authSession.user || authSession.user.status !== UserStatus.ACTIVE) {
    return null;
  }

  const identityUser = authSession.user.displayName && authSession.user.publicUserId
    ? authSession.user
    : await ensureUserDisplayIdentity(authSession.user.id);

  await prisma.authSession.update({
    where: { id: authSession.id },
    data: {
      lastSeenAt: new Date(),
    },
  }).catch(() => null);

  return {
    authSession,
    user: identityUser,
    device: authSession.device,
    session: buildPublicSession(authSession),
    publicUser: buildPublicUser(identityUser),
    publicDevice: buildPublicDevice(authSession.device),
  };
}

export async function refreshAuthSession(input: {
  refreshToken: string;
  clientDeviceId?: string | null;
  deviceName?: string | null;
  deviceType?: string | null;
  platform?: string | null;
  clientVersion?: string | null;
  loginIp?: string | null;
}) {
  const refreshToken = input.refreshToken.trim();
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  const existing = await prisma.authSession.findUnique({
    where: { refreshTokenHash: hashToken(refreshToken) },
    include: {
      user: true,
      device: true,
    },
  });

  if (!existing || existing.revokedAt) {
    throw new Error("Invalid refresh token");
  }

  if (existing.refreshTokenExpiresAt.getTime() <= Date.now()) {
    throw new Error("Refresh token expired");
  }

  if (!existing.user || existing.user.status !== UserStatus.ACTIVE) {
    throw new Error("User unavailable");
  }

  const refreshedUser = await prisma.user.update({
    where: { id: existing.user.id },
    data: {
      firstLoginAt: existing.user.firstLoginAt ?? new Date(),
      lastLoginAt: new Date(),
      lastLoginIp: input.loginIp?.trim() || existing.user.lastLoginIp || null,
    },
  }).catch(() => null);
  const identityUser = await ensureUserDisplayIdentity((refreshedUser ?? existing.user).id);

  const clientDeviceId = input.clientDeviceId?.trim() || null;
  if (
    clientDeviceId
    && existing.device?.clientDeviceId
    && existing.device.clientDeviceId !== clientDeviceId
  ) {
    throw new Error("Device mismatch");
  }

  const device = await resolveOrCreateDevice({
    userId: identityUser.id,
    clientDeviceId: clientDeviceId ?? existing.device?.clientDeviceId ?? null,
    deviceName: input.deviceName ?? existing.device?.deviceName ?? null,
    deviceType: input.deviceType ?? existing.device?.deviceType ?? null,
    platform: input.platform ?? existing.device?.platform ?? null,
    clientVersion: input.clientVersion ?? existing.device?.clientVersion ?? null,
  });

  const nextAccessToken = issueOpaqueToken("at");
  const nextRefreshToken = issueOpaqueToken("rt");
  const updated = await prisma.authSession.update({
    where: { id: existing.id },
    data: {
      deviceId: device?.id ?? existing.deviceId ?? null,
      accessTokenHash: hashToken(nextAccessToken),
      refreshTokenHash: hashToken(nextRefreshToken),
      accessTokenExpiresAt: nowPlusSeconds(getAccessTokenTtlSeconds()),
      refreshTokenExpiresAt: nowPlusDays(getRefreshTokenTtlDays()),
      lastSeenAt: new Date(),
    },
  });

  return {
    success: true,
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken,
    expiresIn: getAccessTokenTtlSeconds(),
    session: buildPublicSession(updated),
    user: buildPublicUser(identityUser),
    device: buildPublicDevice(device ?? existing.device),
  };
}

export async function revokeAuthSession(input: {
  accessToken?: string | null;
  refreshToken?: string | null;
}) {
  const accessToken = input.accessToken?.trim() || null;
  const refreshToken = input.refreshToken?.trim() || null;

  if (!accessToken && !refreshToken) {
    return { success: true, revoked: false };
  }

  const existing = refreshToken
    ? await prisma.authSession.findUnique({
        where: { refreshTokenHash: hashToken(refreshToken) },
      })
    : accessToken
      ? await prisma.authSession.findUnique({
          where: { accessTokenHash: hashToken(accessToken) },
        })
      : null;

  if (!existing || existing.revokedAt) {
    return { success: true, revoked: false };
  }

  await prisma.authSession.update({
    where: { id: existing.id },
    data: {
      revokedAt: new Date(),
    },
  });

  return { success: true, revoked: true };
}
