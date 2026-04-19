import { NextResponse } from "next/server";
import { AdminRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/admin";

type AuditType = "ALL" | "CONFIG_UPDATE" | "AUTH" | "ANNOUNCE" | "SYSTEM";

function inferAuditType(action: string): Exclude<AuditType, "ALL"> {
  const normalized = action.toLowerCase();

  if (
    normalized.includes("config") ||
    normalized.includes("channel_config") ||
    normalized.includes("onboarding_config")
  ) {
    return "CONFIG_UPDATE";
  }

  if (
    normalized.includes("auth") ||
    normalized.includes("login") ||
    normalized.includes("qr_") ||
    normalized.includes("wechat_callback") ||
    normalized.includes("challenge")
  ) {
    return "AUTH";
  }

  if (normalized.includes("announcement")) {
    return "ANNOUNCE";
  }

  return "SYSTEM";
}

function normalizeActor(
  metadataJson: unknown,
  userId?: string | null,
) {
  if (
    metadataJson &&
    typeof metadataJson === "object" &&
    "actor" in metadataJson &&
    metadataJson.actor &&
    typeof metadataJson.actor === "object"
  ) {
    const actor = metadataJson.actor as Record<string, unknown>;
    return (
      (typeof actor.email === "string" && actor.email) ||
      (typeof actor.id === "string" && actor.id) ||
      (typeof actor.role === "string" && actor.role) ||
      "System"
    );
  }

  if (userId) return userId;
  return "System";
}

export async function GET(request: Request) {
  const admin = await requireAdminRole([AdminRole.SUPER_ADMIN]);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim();
  const type = (searchParams.get("type") || "ALL") as AuditType;

  const items = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 200,
  });

  const normalizedItems = items
    .map((item) => {
      const eventType = inferAuditType(item.action);
      const actor = normalizeActor(item.metadataJson, item.userId);
      const detailsText = item.metadataJson
        ? JSON.stringify(item.metadataJson)
        : "";

      return {
        id: item.id,
        createdAt: item.createdAt,
        action: item.action,
        eventType,
        actor,
        userId: item.userId,
        targetType: item.targetType,
        targetId: item.targetId,
        detailsText,
        metadataJson: item.metadataJson,
      };
    })
    .filter((item) => (type === "ALL" ? true : item.eventType === type))
    .filter((item) => {
      if (!query) return true;

      const haystack = [
        item.action,
        item.actor,
        item.targetType || "",
        item.targetId || "",
        item.detailsText,
      ]
        .join("\n")
        .toLowerCase();

      return haystack.includes(query.toLowerCase());
    });

  return NextResponse.json({
    items: normalizedItems,
  });
}
