import { NextResponse } from "next/server";
import { QrLoginChallengeStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createAuditLog, requireAdmin } from "@/lib/admin";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";

export function OPTIONS(request: Request) {
  return buildCorsPreflightResponse(request.headers.get("origin"));
}

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const origin = request.headers.get("origin");
  const admin = await requireAdmin();
  if (!admin.ok) {
    return withCors(NextResponse.json({ error: admin.error }, { status: admin.status }), origin);
  }

  const { token } = await context.params;
  const challenge = await prisma.qrLoginChallenge.findUnique({
    where: { qrToken: token },
  });

  if (!challenge) {
    return withCors(NextResponse.json({ error: "Challenge not found" }, { status: 404 }), origin);
  }

  if (challenge.expiresAt.getTime() <= Date.now()) {
    const expired = await prisma.qrLoginChallenge.update({
      where: { id: challenge.id },
      data: { status: QrLoginChallengeStatus.EXPIRED },
    });

    return withCors(NextResponse.json({ challenge: expired, error: "Challenge expired" }, { status: 409 }), origin);
  }

  const approved = await prisma.qrLoginChallenge.update({
    where: { id: challenge.id },
    data: {
      status: QrLoginChallengeStatus.APPROVED,
      approvedAt: new Date(),
    },
  });

  await createAuditLog({
    userId: null,
    action: "qr_login_challenge.approved",
    targetType: "QrLoginChallenge",
    targetId: approved.id,
    metadataJson: {
      actor: {
        id: admin.user.id,
        email: admin.user.email,
        role: admin.user.role,
      },
      qrToken: approved.qrToken,
      status: approved.status,
    },
  });

  return withCors(NextResponse.json({ challenge: approved }), origin);
}
