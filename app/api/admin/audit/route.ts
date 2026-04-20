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
  const rawPage = Number(searchParams.get("page") || 1);
  const rawLimit = Number(searchParams.get("limit") || 20);
  const page = Number.isFinite(rawPage) ? Math.max(1, Math.floor(rawPage)) : 1;
  const limit = Number.isFinite(rawLimit)
    ? Math.max(1, Math.min(Math.floor(rawLimit), 100))
    : 20;

  const items = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
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

  const total = normalizedItems.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const pagedItems = normalizedItems.slice((safePage - 1) * limit, safePage * limit);

  return NextResponse.json({
    items: pagedItems,
    pagination: {
      total,
      page: safePage,
      limit,
      totalPages,
    },
  });
}

export async function DELETE(request: Request) {
  const admin = await requireAdminRole([AdminRole.SUPER_ADMIN]);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = await request.json().catch(() => ({}));
  const scope = body?.scope === "filtered" ? "filtered" : "all";
  const query = typeof body?.q === "string" ? body.q.trim() : "";
  const type = (body?.type || "ALL") as AuditType;

  if (scope === "all") {
    const result = await prisma.auditLog.deleteMany({});
    return NextResponse.json({ success: true, deletedCount: result.count });
  }

  const items = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const filteredIds = items
    .map((item) => {
      const eventType = inferAuditType(item.action);
      const actor = normalizeActor(item.metadataJson, item.userId);
      const detailsText = item.metadataJson ? JSON.stringify(item.metadataJson) : "";

      return {
        id: item.id,
        eventType,
        action: item.action,
        actor,
        targetType: item.targetType,
        targetId: item.targetId,
        detailsText,
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
    })
    .map((item) => item.id);

  if (filteredIds.length === 0) {
    return NextResponse.json({ success: true, deletedCount: 0 });
  }

  const result = await prisma.auditLog.deleteMany({
    where: {
      id: {
        in: filteredIds,
      },
    },
  });

  return NextResponse.json({ success: true, deletedCount: result.count });
}
