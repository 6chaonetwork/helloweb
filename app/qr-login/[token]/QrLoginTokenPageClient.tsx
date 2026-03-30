"use client";

import { useEffect, useState } from "react";

type ChallengeData = {
  challenge: {
    id: string;
    qrToken: string;
    status: string;
    expiresAt: string;
    approvedAt?: string | null;
  };
};

export default function QrLoginTokenPageClient({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("PENDING");

  async function loadStatus() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/qr-login/challenge/${token}`, { cache: "no-store" });
      const data = (await response.json()) as ChallengeData;
      if (!response.ok) {
        setError((data as { error?: string }).error || "无法读取当前二维码状态");
        return;
      }

      setStatus(data.challenge.status);
      if (data.challenge.status === "APPROVED") {
        setMessage("这台设备已经确认登录，你可以返回桌面客户端继续。 ");
      }
    } catch {
      setError("无法读取当前二维码状态");
    } finally {
      setLoading(false);
    }
  }

  async function approve() {
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/qr-login/challenge/${token}/approve`, {
        method: "POST",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "确认登录失败");
        return;
      }

      setStatus(data.challenge?.status || "APPROVED");
      setMessage("确认成功。现在可以回到桌面客户端继续。 ");
    } catch {
      setError("确认登录失败，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, [token]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_24%),linear-gradient(180deg,#050816,#090d18)] px-6 py-10 text-white">
      <div className="mx-auto max-w-xl">
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
          <p className="m-0 text-xs uppercase tracking-[0.28em] text-white/42">HelloClaw QR Login</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight">确认这台设备的登录请求</h1>
          <p className="mt-4 text-base leading-8 text-white/68">
            这是 HelloClaw 桌面端发起的扫码登录确认页。确认后，桌面客户端会继续完成连接。
          </p>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-[#0c1224] p-5">
            <div className="text-sm text-white/50">当前状态</div>
            <div className="mt-3 text-2xl font-semibold text-white">{loading ? "读取中..." : status}</div>
            <div className="mt-3 break-all text-xs leading-6 text-white/36">token: {token}</div>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {message}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={approve}
              disabled={submitting || loading || status === "APPROVED"}
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#08101f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "确认中..." : status === "APPROVED" ? "已确认" : "确认登录这台设备"}
            </button>
            <button
              type="button"
              onClick={loadStatus}
              disabled={loading}
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/12 bg-white/4 px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              刷新状态
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
