import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureDefaultAnnouncements } from "@/lib/announcements";
import { createAuditLog, requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  await ensureDefaultAnnouncements();
  const items = await prisma.announcement.findMany({
    orderBy: [
      { pinned: "desc" },
      { sortOrder: "desc" },
      { createdAt: "desc" },
    ],
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = await request.json();
  const item = await prisma.announcement.create({
    data: {
      category: typeof body.category === "string" ? body.category : "官方公告",
      title: typeof body.title === "string" ? body.title : "未命名公告",
      content: typeof body.content === "string" ? body.content : "",
      summary: typeof body.summary === "string" ? body.summary : null,
      status: typeof body.status === "string" ? body.status : "ACTIVE",
      pinned: typeof body.pinned === "boolean" ? body.pinned : false,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
    },
  });

  await createAuditLog({
    userId: null,
    action: "announcement.created",
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
