import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { readAdminSessionCookieValue, getAdminSessionCookieName } from "@/lib/admin-auth";
import type { Prisma } from "@prisma/client";

function isAdminPreviewEnabled() {
  return process.env.ADMIN_PREVIEW_BYPASS === "1";
}

export async function requireAdmin() {
  if (isAdminPreviewEnabled()) {
    return {
      ok: true as const,
      user: {
        id: "preview-admin",
        role: "ADMIN",
        email: "preview@local",
      },
    };
  }

  const cookieStore = await cookies();
  const session = readAdminSessionCookieValue(cookieStore.get(getAdminSessionCookieName())?.value);

  if (session) {
    return {
      ok: true as const,
      user: {
        id: session.username,
        role: "ADMIN",
        email: `${session.username}@local`,
      },
    };
  }

  return { ok: false as const, status: 401, error: "Unauthorized" };
}

export async function createAuditLog(input: {
  userId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadataJson?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
}) {
  return prisma.auditLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      metadataJson: input.metadataJson,
    },
  });
}
