"use client";

import { useEffect, useState } from "react";
import { ArrowRight, LayoutDashboard, QrCode, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const highlights = [
  {
    icon: LayoutDashboard,
    title: "正式控制台入口",
    description: "统一进入渠道、用户、内容、审计与系统后台。",
  },
  {
    icon: QrCode,
    title: "扫码链路联调",
    description: "直接验证 challenge、设备绑定和用户身份链路状态。",
  },
  {
    icon: ShieldCheck,
    title: "多管理员体系",
    description: "基于 Admin 表与 NextAuth 会话，实现真正的多账号权限控制。",
  },
];

export function AdminLoginForm() {
  const [csrfToken, setCsrfToken] = useState("");
  const [callbackUrl, setCallbackUrl] = useState("/dashboard");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    const callbackParam = params.get("callbackUrl");

    setCallbackUrl(callbackParam || "/dashboard");

    if (errorParam === "CredentialsSignin") {
      setError("用户名或密码错误");
    } else if (errorParam === "AccessDenied") {
      setError("当前账号无权登录后台");
    } else if (errorParam) {
      setError("登录失败，请稍后再试");
    }

    void fetch("/api/auth/csrf", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load csrf token");
        }

        const payload = (await response.json()) as { csrfToken?: string };
        setCsrfToken(payload.csrfToken || "");
      })
      .catch(() => {
        setError("登录初始化失败，请刷新页面后重试");
      });
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(230,0,0,0.06),transparent_18%),linear-gradient(180deg,#fafafa_0%,#f5f5f5_44%,#fafafa_100%)] px-4 py-6 text-zinc-900 md:px-6 md:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1380px] gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
        <Card className="rounded-[32px] border-zinc-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardContent className="flex h-full flex-col justify-between p-8 md:p-10">
            <div>
              <Badge className="border-claw-red/18 bg-red-50 text-claw-red">
                Admin Control Center
              </Badge>
              <h1 className="mt-6 max-w-4xl text-balance text-5xl font-semibold leading-none tracking-[-0.06em] text-zinc-900 md:text-6xl xl:text-7xl">
                进入 HelloClaw 的正式后台工作区。
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-9 text-zinc-500">
                当前后台已经升级为基于 NextAuth 的管理员控制台，统一承接配置、运营和系统权限。
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-5"
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-claw-red/16 bg-red-50 text-claw-red">
                      <Icon size={18} />
                    </div>
                    <div className="mt-4 text-lg font-semibold text-zinc-900">{item.title}</div>
                    <p className="mt-2 text-sm leading-7 text-zinc-500">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-zinc-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardContent className="flex h-full flex-col justify-center p-8 md:p-10">
            <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">
              Sign In
            </div>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-zinc-900">
              登录后台
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-500">
              使用管理员账号进入控制台，继续配置渠道、查看用户状态或推进后续系统接入。
            </p>

            <form
              className="mt-8 grid gap-4"
              method="post"
              action="/api/auth/callback/credentials"
            >
              <input name="csrfToken" type="hidden" value={csrfToken} />
              <input name="callbackUrl" type="hidden" value={callbackUrl} />
              <label className="grid gap-2">
                <span className="text-sm text-zinc-500">账号</span>
                <Input
                  className="border-zinc-200 bg-white text-zinc-900"
                  name="username"
                  placeholder="请输入管理员账号"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-zinc-500">密码</span>
                <Input
                  className="border-zinc-200 bg-white text-zinc-900"
                  type="password"
                  name="password"
                  placeholder="请输入后台密码"
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={!csrfToken}
                size="lg"
                className="mt-2 bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92"
              >
                {csrfToken ? "进入控制台" : "初始化登录中..."}
                {csrfToken ? <ArrowRight size={16} /> : null}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
