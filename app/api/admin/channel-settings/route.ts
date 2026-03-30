import { NextResponse } from "next/server";
import { ChannelEnvironment } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createAuditLog, requireAdmin } from "@/lib/admin";

const DEFAULT_CHANNEL_TYPE = "WECHAT_OFFICIAL_ACCOUNT";

async function getOrCreateChannelConfig() {
  const existing = await prisma.channelConfig.findUnique({
    where: { channelType: DEFAULT_CHANNEL_TYPE },
  });

  if (existing) return existing;

  return prisma.channelConfig.create({
    data: {
      channelType: DEFAULT_CHANNEL_TYPE,
      enabled: false,
      environment: ChannelEnvironment.DEV,
      allowedPlatforms: ["windows", "mac", "linux"],
      deviceBindingMode: "OPTIONAL",
      challengeTtlSeconds: 300,
      pollingIntervalMs: 2000,
    },
  });
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const config = await getOrCreateChannelConfig();
  return NextResponse.json({ config });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = await request.json();
  const existing = await getOrCreateChannelConfig();

  const config = await prisma.channelConfig.update({
    where: { id: existing.id },
    data: {
      appId: body.appId ?? existing.appId,
      callbackUrl: body.callbackUrl ?? existing.callbackUrl,
      qrLoginBaseUrl: body.qrLoginBaseUrl ?? existing.qrLoginBaseUrl,
      webhookUrl: body.webhookUrl ?? existing.webhookUrl,
      verifyToken: body.verifyToken ?? existing.verifyToken,
      enabled: typeof body.enabled === "boolean" ? body.enabled : existing.enabled,
      environment:
        body.environment && Object.values(ChannelEnvironment).includes(body.environment)
          ? body.environment
          : existing.environment,
      allowedPlatforms: Array.isArray(body.allowedPlatforms) ? body.allowedPlatforms : existing.allowedPlatforms,
      deviceBindingMode: body.deviceBindingMode ?? existing.deviceBindingMode,
      challengeTtlSeconds:
        typeof body.challengeTtlSeconds === "number" ? body.challengeTtlSeconds : existing.challengeTtlSeconds,
      pollingIntervalMs:
        typeof body.pollingIntervalMs === "number" ? body.pollingIntervalMs : existing.pollingIntervalMs,
    },
  });

  await createAuditLog({
    userId: admin.user.id,
    action: "channel_config.updated",
    targetType: "ChannelConfig",
    targetId: config.id,
    metadataJson: {
      channelType: config.channelType,
      enabled: config.enabled,
      environment: config.environment,
    },
  });

  return NextResponse.json({ config });
}
