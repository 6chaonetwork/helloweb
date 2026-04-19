import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { AdminRole, AdminStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createAuditLog, requireAdminRole } from "@/lib/admin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminRole([AdminRole.SUPER_ADMIN]);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { id } = await context.params;
  const existing = await prisma.admin.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const nextRole =
    body.role === AdminRole.SUPER_ADMIN || body.role === AdminRole.OPERATOR
      ? body.role
      : existing.role;
  const nextStatus =
    body.status === AdminStatus.ACTIVE || body.status === AdminStatus.DISABLED
      ? body.status
      : existing.status;
  const nextUsername =
    typeof body.username === "string" && body.username.trim()
      ? body.username.trim()
      : existing.username;
  const nextPasswordHash =
    typeof body.password === "string" && body.password
      ? await hash(body.password, 12)
      : existing.passwordHash;

  if (existing.id === admin.user.id && nextStatus === AdminStatus.DISABLED) {
    return NextResponse.json({ error: "Cannot disable current signed-in admin" }, { status: 400 });
  }

  const updated = await prisma.admin.update({
    where: { id },
    data: {
      username: nextUsername,
      role: nextRole,
      status: nextStatus,
      passwordHash: nextPasswordHash,
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
    action: "admin_account.updated",
    targetType: "Admin",
    targetId: updated.id,
    metadataJson: {
      actor: {
        id: admin.user.id,
        username: admin.user.username,
        role: admin.user.role,
      },
      before: {
        username: existing.username,
        role: existing.role,
        status: existing.status,
      },
      after: {
        username: updated.username,
        role: updated.role,
        status: updated.status,
      },
    },
  });

  return NextResponse.json({ item: updated });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminRole([AdminRole.SUPER_ADMIN]);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { id } = await context.params;
  const existing = await prisma.admin.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  if (existing.id === admin.user.id) {
    return NextResponse.json({ error: "Cannot delete current signed-in admin" }, { status: 400 });
  }

  const superAdminCount = await prisma.admin.count({
    where: {
      role: AdminRole.SUPER_ADMIN,
      status: AdminStatus.ACTIVE,
    },
  });

  if (existing.role === AdminRole.SUPER_ADMIN && existing.status === AdminStatus.ACTIVE && superAdminCount <= 1) {
    return NextResponse.json({ error: "Cannot delete the last active super admin" }, { status: 400 });
  }

  await prisma.admin.delete({
    where: { id },
  });

  await createAuditLog({
    action: "admin_account.deleted",
    targetType: "Admin",
    targetId: existing.id,
    metadataJson: {
      actor: {
        id: admin.user.id,
        username: admin.user.username,
        role: admin.user.role,
      },
      deleted: {
        username: existing.username,
        role: existing.role,
        status: existing.status,
      },
    },
  });

  return NextResponse.json({ success: true });
}
