import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAuditLog, requireAdmin } from "@/lib/admin";
import { ensureDefaultOnboardingConfig } from "@/lib/onboarding-config";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const config = await ensureDefaultOnboardingConfig();
  return NextResponse.json({ config });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = await request.json();
  const existing = await ensureDefaultOnboardingConfig();

  const config = await prisma.onboardingConfig.update({
    where: { key: existing.key },
    data: {
      badge: body.badge ?? existing.badge,
      titleLine1: body.titleLine1 ?? existing.titleLine1,
      titleLine2: body.titleLine2 ?? existing.titleLine2,
      description: body.description ?? existing.description,
      featureTagsJson: Array.isArray(body.featureTags) ? body.featureTags : existing.featureTagsJson,
      qrTitle: body.qrTitle ?? existing.qrTitle,
      stepsJson: Array.isArray(body.steps) ? body.steps : existing.stepsJson,
      statusSectionTitle: body.statusSectionTitle ?? existing.statusSectionTitle,
      statusTitle: body.statusTitle ?? existing.statusTitle,
      statusDescription: body.statusDescription ?? existing.statusDescription,
      statusCardsJson: Array.isArray(body.statusCards) ? body.statusCards : existing.statusCardsJson,
      completionTip: body.completionTip ?? existing.completionTip,
      primaryButton: body.primaryButton ?? existing.primaryButton,
      secondaryButton: body.secondaryButton ?? existing.secondaryButton,
      contactText: body.contactText ?? existing.contactText,
    },
  });

  await createAuditLog({
    userId: null,
    action: "onboarding_config.updated",
    targetType: "OnboardingConfig",
    targetId: config.key,
    metadataJson: {
      key: config.key,
      titleLine1: config.titleLine1,
      titleLine2: config.titleLine2,
    },
  });

  return NextResponse.json({ config });
}
