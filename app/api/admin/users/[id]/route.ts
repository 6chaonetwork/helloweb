import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { id } = await context.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      devices: {
        orderBy: { updatedAt: "desc" },
      },
      authSessions: {
        orderBy: { updatedAt: "desc" },
      },
      qrChallenges: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      _count: {
        select: {
          devices: true,
          authSessions: true,
          qrChallenges: true,
          auditLogs: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
