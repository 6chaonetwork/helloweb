import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAuditLog, requireAdmin } from "@/lib/admin";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { id } = await context.params;
  const body = await request.json();

  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
  }

  const item = await prisma.announcement.update({
    where: { id },
    data: {
      category: body.category ?? existing.category,
      title: body.title ?? existing.title,
      content: body.content ?? existing.content,
      summary: body.summary ?? existing.summary,
      status: body.status ?? existing.status,
      pinned: typeof body.pinned === "boolean" ? body.pinned : existing.pinned,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : existing.sortOrder,
    },
  });

  await createAuditLog({
    userId: null,
    action: "announcement.updated",
    targetType: "Announcement",
    targetId: item.id,
    metadataJson: {
      title: item.title,
      category: item.category,
      status: item.status,
    },
  });

  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { id } = await context.params;
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
  }

  await prisma.announcement.delete({ where: { id } });
  await createAuditLog({
    userId: null,
    action: "announcement.deleted",
    targetType: "Announcement",
    targetId: existing.id,
    metadataJson: {
      title: existing.title,
      category: existing.category,
    },
  });

  return NextResponse.json({ success: true });
}
