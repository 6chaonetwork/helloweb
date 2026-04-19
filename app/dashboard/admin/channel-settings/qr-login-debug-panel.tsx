"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ChallengeResponse = {
  challenge: {
    id: string;
    qrToken: string;
    eventKey?: string;
    status: string;
    expiresAt: string;
    approvedAt?: string | null;
    qrUrl?: string;
    qrTicket?: string | null;
    qrSource?: "wechat" | "fallback";
    fallbackQrUrl?: string;
    qrCreateError?: string | null;
  };
};

export function QrLoginDebugPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<ChallengeResponse["challenge"] | null>(null);

  async function createChallenge() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/qr-login/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = (await response.json()) as ChallengeResponse;
      if (!response.ok) {
        setError("创建 challenge 失败");
        return;
      }

      setChallenge(data.challenge);
      setMessage(
        data.challenge.qrSource === "wechat"
          ? "challenge 已生成，当前为真实微信参数二维码。"
          : "challenge 已生成，当前回退为网页登录二维码。"
      );
    } catch {
      setError("创建 challenge 失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  async function simulateWechatCallback() {
    if (!challenge?.eventKey) {
      setError("请先生成 challenge");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const xml = `<xml>
<ToUserName><![CDATA[gh_test]]></ToUserName>
<FromUserName><![CDATA[user_openid_test]]></FromUserName>
<CreateTime>${Math.floor(Date.now() / 1000)}</CreateTime>
<MsgType><![CDATA[event]]></MsgType>
<Event><![CDATA[SCAN]]></Event>
<EventKey><![CDATA[${challenge.eventKey}]]></EventKey>
<Ticket><![CDATA[test_ticket]]></Ticket>
</xml>`;

    try {
      const response = await fetch("/api/wechat/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/xml",
        },
        body: xml,
      });

      const text = await response.text();
      if (!response.ok) {
        setError(`模拟回调失败：${text}`);
        return;
      }

      setMessage("已模拟微信扫码回调");
      await refreshStatus();
    } catch {
      setError("模拟微信回调失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  async function refreshStatus() {
    if (!challenge?.qrToken) {
      setError("请先生成 challenge");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/qr-login/challenge/${challenge.qrToken}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as ChallengeResponse;
      if (!response.ok) {
        setError("刷新状态失败");
        return;
      }

      setChallenge((prev) => ({
        ...prev,
        ...data.challenge,
      }));
      setMessage(`当前状态：${data.challenge.status}`);
    } catch {
      setError("刷新状态失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card id="qr-debug" className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <p className="m-0 text-xs uppercase tracking-[0.22em] text-zinc-500">QR Login Debug</p>
        <h2 className="mb-3 mt-3 text-2xl font-semibold text-zinc-900">扫码登录调试面板</h2>
        <p className="mb-6 text-zinc-500">
          这里用于当前阶段联调。你可以直接在网页里生成 challenge、模拟微信扫码回调，并实时查看 challenge 状态。
        </p>

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={createChallenge} disabled={loading} className="bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92">
            生成 challenge
          </Button>
          <Button type="button" variant="outline" onClick={simulateWechatCallback} disabled={loading || !challenge} className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900">
            模拟微信扫码回调
          </Button>
          <Button type="button" variant="outline" onClick={refreshStatus} disabled={loading || !challenge} className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900">
            刷新状态
          </Button>
        </div>

        {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}
        {message ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{message}</div> : null}

        {challenge ? (
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-900 p-4 font-mono text-sm text-green-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">Debug Output</div>
            <div className="grid gap-3">
              <div><strong className="text-zinc-300">qrToken:</strong> {challenge.qrToken}</div>
              <div><strong className="text-zinc-300">eventKey:</strong> {challenge.eventKey || "-"}</div>
              <div><strong className="text-zinc-300">status:</strong> {challenge.status}</div>
              <div><strong className="text-zinc-300">expiresAt:</strong> {challenge.expiresAt}</div>
              <div><strong className="text-zinc-300">approvedAt:</strong> {challenge.approvedAt || "-"}</div>
              <div><strong className="text-zinc-300">qrSource:</strong> {challenge.qrSource || "-"}</div>
              <div><strong className="text-zinc-300">qrTicket:</strong> {challenge.qrTicket || "-"}</div>
              <div className="break-all"><strong className="text-zinc-300">qrUrl:</strong> {challenge.qrUrl || "-"}</div>
              <div className="break-all"><strong className="text-zinc-300">fallbackQrUrl:</strong> {challenge.fallbackQrUrl || "-"}</div>
              <div className="break-all"><strong className="text-zinc-300">qrCreateError:</strong> {challenge.qrCreateError || "-"}</div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
