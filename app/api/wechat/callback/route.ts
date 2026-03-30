import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEFAULT_CHANNEL_TYPE = "WECHAT_OFFICIAL_ACCOUNT";

async function getVerifyToken() {
  const config = await prisma.channelConfig.findUnique({
    where: { channelType: DEFAULT_CHANNEL_TYPE },
    select: { verifyToken: true },
  });

  return config?.verifyToken || process.env.WECHAT_VERIFY_TOKEN || null;
}

function buildSignature(token: string, timestamp: string, nonce: string) {
  return createHash("sha1")
    .update([token, timestamp, nonce].sort().join(""))
    .digest("hex");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const signature = searchParams.get("signature") || "";
  const timestamp = searchParams.get("timestamp") || "";
  const nonce = searchParams.get("nonce") || "";
  const echostr = searchParams.get("echostr") || "";

  const verifyToken = await getVerifyToken();
  if (!verifyToken) {
    return new NextResponse("Missing verify token", { status: 500 });
  }

  if (!signature || !timestamp || !nonce || !echostr) {
    return new NextResponse("Missing required query params", { status: 400 });
  }

  const expectedSignature = buildSignature(verifyToken, timestamp, nonce);
  if (expectedSignature !== signature) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  return new NextResponse(echostr, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export async function POST(request: Request) {
  const body = await request.text();

  return NextResponse.json({
    ok: true,
    message: "WeChat callback placeholder received",
    receivedBytes: body.length,
  });
}
