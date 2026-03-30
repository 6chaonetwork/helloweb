import { NextResponse } from "next/server";
import { QrLoginChallengeStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/admin";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";

export function OPTIONS(request: Request) {
  return buildCorsPreflightResponse(request.headers.get("origin"));
}

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const origin = request.headers.get("origin");
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
    action: "qr_login_challenge.approved_from_qr_page",
    targetType: "QrLoginChallenge",
    targetId: approved.id,
    metadataJson: {
      qrToken: approved.qrToken,
      status: approved.status,
      approvedVia: "qr-login-page",
    },
  });

  return withCors(NextResponse.json({ challenge: approved }), origin);
}
