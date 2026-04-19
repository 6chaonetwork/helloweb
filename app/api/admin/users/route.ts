import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

function buildUserWhere(query: string) {
  const q = query.trim();
  if (!q) return undefined;

  return {
    OR: [
      { name: { contains: q, mode: "insensitive" as const } },
      { email: { contains: q, mode: "insensitive" as const } },
      { wechatNickname: { contains: q, mode: "insensitive" as const } },
      { wechatOpenId: { contains: q } },
      { devices: { some: { deviceName: { contains: q, mode: "insensitive" as const } } } },
    ],
  };
}

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const rawLimit = Number(searchParams.get("limit") || 50);
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 200)) : 50;
  const where = buildUserWhere(query);

  const [items, totalUsers, followedUsers, activeSessions, activeDevices] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: [{ lastLoginAt: "desc" }, { updatedAt: "desc" }],
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        lastLoginAt: true,
        status: true,
        wechatOpenId: true,
        wechatUnionId: true,
        wechatFollowed: true,
        wechatNickname: true,
        wechatProfileSyncStatus: true,
        createdAt: true,
        updatedAt: true,
        devices: {
          orderBy: { updatedAt: "desc" },
          take: 3,
          select: {
            id: true,
            clientDeviceId: true,
            deviceName: true,
            deviceType: true,
            platform: true,
            clientVersion: true,
            status: true,
            lastSeenAt: true,
            updatedAt: true,
          },
        },
        authSessions: {
          orderBy: { updatedAt: "desc" },
          take: 3,
          select: {
            id: true,
            deviceId: true,
            accessTokenExpiresAt: true,
            refreshTokenExpiresAt: true,
            lastSeenAt: true,
            revokedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        qrChallenges: {
          orderBy: { createdAt: "desc" },
          take: 3,
          select: {
            id: true,
            status: true,
            qrSource: true,
            qrToken: true,
            clientDeviceId: true,
            wechatOpenId: true,
            approvedAt: true,
            consumedAt: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            devices: true,
            authSessions: true,
            qrChallenges: true,
          },
        },
      },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { wechatFollowed: true } }),
    prisma.authSession.count({ where: { revokedAt: null } }),
    prisma.device.count({ where: { status: "ACTIVE" } }),
  ]);

  return NextResponse.json({
    stats: {
      totalUsers,
      followedUsers,
      activeSessions,
      activeDevices,
    },
    items,
  });
}
