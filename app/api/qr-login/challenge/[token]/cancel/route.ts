import { NextResponse } from "next/server";
import { QrLoginChallengeStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
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
    return withCors(NextResponse.json({ success: false, error: "Challenge not found" }, { status: 404 }), origin);
  }

  if (
    challenge.status === QrLoginChallengeStatus.CANCELED
    || challenge.status === QrLoginChallengeStatus.CONSUMED
    || challenge.status === QrLoginChallengeStatus.EXPIRED
  ) {
    return withCors(NextResponse.json({ success: true, challenge }), origin);
  }

  const canceled = await prisma.qrLoginChallenge.update({
    where: { id: challenge.id },
    data: {
      status: QrLoginChallengeStatus.CANCELED,
      canceledAt: new Date(),
    },
  });

  return withCors(NextResponse.json({ success: true, challenge: canceled }), origin);
}
