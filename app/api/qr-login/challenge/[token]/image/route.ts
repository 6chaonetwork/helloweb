import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildQrLoginUrl } from "@/lib/qr-login";
import { buildWechatQrImageUrl } from "@/lib/wechat";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;

  const challenge = await prisma.qrLoginChallenge.findUnique({
    where: { qrToken: token },
  });

  if (!challenge) {
    return new NextResponse("Challenge not found", { status: 404 });
  }

  const fallbackQrUrl = challenge.fallbackQrUrl || buildQrLoginUrl(challenge.qrToken);

  if (challenge.qrSource !== "wechat") {
    return NextResponse.redirect(fallbackQrUrl, { status: 302 });
  }

  const upstreamQrUrl = challenge.qrTicket
    ? buildWechatQrImageUrl(challenge.qrTicket)
    : challenge.qrUrl;

  if (!upstreamQrUrl) {
    return new NextResponse("Missing upstream QR image url", { status: 404 });
  }

  const upstream = await fetch(upstreamQrUrl, {
    method: "GET",
    cache: "no-store",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      Referer: "https://mp.weixin.qq.com/",
    },
  });

  if (!upstream.ok) {
    return new NextResponse(`Failed to fetch upstream QR image: ${upstream.status}`, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") || "image/png";
  const cacheControl = upstream.headers.get("cache-control") || "public, max-age=60";
  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": cacheControl,
    },
  });
}
