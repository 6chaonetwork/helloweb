import { prisma } from "@/lib/db";
import type { AdminRole, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    return {
      ok: true as const,
      user: {
        id: session.user.id,
        role: session.user.role,
        username: session.user.username,
        email: `${session.user.username}@local`,
      },
    };
  }

  return { ok: false as const, status: 401, error: "Unauthorized" };
}

export function hasAdminRole(
  role: AdminRole,
  allowedRoles: AdminRole[],
) {
  return allowedRoles.includes(role);
}

export async function requireAdminRole(allowedRoles: AdminRole[]) {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return admin;
  }

  if (!hasAdminRole(admin.user.role, allowedRoles)) {
    return {
      ok: false as const,
      status: 403,
      error: "Forbidden",
    };
  }

  return admin;
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
