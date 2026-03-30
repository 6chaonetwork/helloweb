"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "登录失败");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("网络异常，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-10 text-white">
      <div className="mx-auto max-w-md rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <p className="m-0 text-xs uppercase tracking-[0.3em] text-white/45">Admin Access</p>
        <h1 className="mb-3 mt-4 text-4xl font-semibold">登录后台</h1>
        <p className="mb-8 text-white/68">先进入后台，再配置公众号参数与扫码登录策略。</p>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm text-white/72">账号</span>
            <input
              className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white outline-none"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="admin"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-white/72">密码</span>
            <input
              type="password"
              className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white outline-none"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入后台密码"
            />
          </label>

          {error ? <p className="m-0 text-sm text-red-300">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-white font-semibold text-[#08101f] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "登录中..." : "进入后台"}
          </button>
        </form>
      </div>
    </main>
  );
}
