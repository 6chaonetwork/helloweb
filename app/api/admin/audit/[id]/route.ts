import { NextResponse } from "next/server";
import { AdminRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/admin";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminRole([AdminRole.SUPER_ADMIN]);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { id } = await context.params;
  const existing = await prisma.auditLog.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Audit log not found" }, { status: 404 });
  }

  await prisma.auditLog.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
