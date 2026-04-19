import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { AdminRole, AdminStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createAuditLog, requireAdminRole } from "@/lib/admin";

export async function GET(request: Request) {
  const admin = await requireAdminRole([AdminRole.SUPER_ADMIN]);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "").trim().toLowerCase();

  const items = await prisma.admin.findMany({
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      username: true,
      role: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const filteredItems = query
    ? items.filter((item) => {
        const haystack = [
          item.username,
          item.role,
          item.status,
        ]
          .join("\n")
          .toLowerCase();
        return haystack.includes(query);
      })
    : items;

  return NextResponse.json({ items: filteredItems });
}

export async function POST(request: Request) {
  const admin = await requireAdminRole([AdminRole.SUPER_ADMIN]);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role =
    body.role === AdminRole.SUPER_ADMIN || body.role === AdminRole.OPERATOR
      ? body.role
      : AdminRole.OPERATOR;

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  const passwordHash = await hash(password, 12);

  const created = await prisma.admin.create({
    data: {
      username,
      passwordHash,
      role,
      status: AdminStatus.ACTIVE,
    },
    select: {
      id: true,
      username: true,
      role: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await createAuditLog({
    action: "admin_account.created",
    targetType: "Admin",
    targetId: created.id,
    metadataJson: {
      actor: {
        id: admin.user.id,
        username: admin.user.username,
        role: admin.user.role,
      },
      username: created.username,
      role: created.role,
      status: created.status,
    },
  });

  return NextResponse.json({ item: created });
}
