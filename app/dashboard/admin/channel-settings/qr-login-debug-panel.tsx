"use client";

import { useState } from "react";

type ChallengeResponse = {
  challenge: {
    id: string;
    qrToken: string;
    eventKey?: string;
    status: string;
    expiresAt: string;
    approvedAt?: string | null;
    qrUrl?: string;
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
      setMessage("challenge 已生成");
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

      setChallenge(data.challenge);
      setMessage(`当前状态：${data.challenge.status}`);
    } catch {
      setError("刷新状态失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-cyan-400/20 bg-cyan-500/8 p-6">
      <p className="m-0 text-xs text-cyan-200/70">QR Login Debug</p>
      <h2 className="mb-3 mt-3 text-2xl font-semibold text-white">扫码登录调试面板</h2>
      <p className="mb-6 text-white/68">
        这里是给当前阶段联调用的。你可以直接在网页里生成 challenge、模拟微信扫码回调、查看 challenge 状态。
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={createChallenge}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 font-semibold text-[#08101f] disabled:opacity-60"
        >
          生成 challenge
        </button>
        <button
          type="button"
          onClick={simulateWechatCallback}
          disabled={loading || !challenge}
          className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/6 px-5 font-semibold text-white disabled:opacity-60"
        >
          模拟微信扫码回调
        </button>
        <button
          type="button"
          onClick={refreshStatus}
          disabled={loading || !challenge}
          className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/6 px-5 font-semibold text-white disabled:opacity-60"
        >
          刷新状态
        </button>
      </div>

      {error ? <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
      {message ? <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div> : null}

      {challenge ? (
        <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-[#0c1224] p-4 text-sm text-white/78">
          <div><strong>qrToken:</strong> {challenge.qrToken}</div>
          <div><strong>eventKey:</strong> {challenge.eventKey || "-"}</div>
          <div><strong>status:</strong> {challenge.status}</div>
          <div><strong>expiresAt:</strong> {challenge.expiresAt}</div>
          <div><strong>approvedAt:</strong> {challenge.approvedAt || "-"}</div>
          <div><strong>qrUrl:</strong> {challenge.qrUrl || "-"}</div>
        </div>
      ) : null}
    </section>
  );
}
