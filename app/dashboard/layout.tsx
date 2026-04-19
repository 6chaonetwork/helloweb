import Link from "next/link";
import {
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { requireAdminPageSession } from "@/lib/require-admin-page-session";
import { DashboardNav } from "./_components/dashboard-nav";
import { DashboardSignOutButton } from "./_components/dashboard-sign-out-button";

const shellSignals = [
  "官网、控制台与后续 HelloAPI 接入共用一套产品语言",
  "先完成正式视觉与结构层，再承接账户、订单与销售数据",
  "当前控制台专注于渠道、用户、公告和 onboarding 模块",
];

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdminPageSession();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(230,0,0,0.06),transparent_18%),linear-gradient(180deg,#fafafa_0%,#f5f5f5_42%,#fafafa_100%)] text-zinc-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] px-4 md:px-5 xl:px-7">
        <aside className="hidden w-[312px] shrink-0 border-r border-zinc-200 pr-6 lg:block">
          <div className="sticky top-0 flex h-screen flex-col gap-6 py-6">
            <div className="rounded-[30px] border border-zinc-200 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-claw-red/20 bg-claw-red/10 font-black text-claw-red shadow-[0_8px_24px_rgba(230,0,0,0.10)]">
                  H
                </div>
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-900">
                    HelloClaw
                  </div>
                  <div className="text-xs text-zinc-500">
                    Crisp operations console
                  </div>
                </div>
              </Link>

              <div className="mt-5 rounded-[24px] border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  Admin Session
                </div>
                <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-zinc-900">
                  {session.username}
                </div>
                <p className="mt-3 text-sm leading-7 text-zinc-500">
                  当前后台已经承接渠道配置、用户身份、内容运营与后续商业化接入的主控制面。
                </p>
              </div>

              <div className="mt-4 grid gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
                >
                  查看官网
                  <ArrowUpRight size={15} />
                </Link>
                <Link
                  href="/deployment"
                  className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
                >
                  部署路径
                </Link>
                <DashboardSignOutButton className="border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900" />
              </div>
            </div>

            <div className="rounded-[30px] border border-zinc-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <DashboardNav />
            </div>

            <div className="rounded-[30px] border border-zinc-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500">
                Current Scope
              </div>
              <div className="mt-4 grid gap-3">
                {shellSignals.map((item, index) => {
                  const icons = [ShieldCheck, Workflow, Sparkles] as const;
                  const Icon = icons[index];

                  return (
                    <div
                      key={item}
                      className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-xl border border-claw-red/14 bg-red-50 text-claw-red">
                          <Icon size={16} />
                        </div>
                        <p className="text-sm leading-6 text-zinc-500">{item}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4 py-4 lg:pl-6">
          <div className="rounded-[28px] border border-zinc-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] lg:hidden">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  HelloClaw Admin
                </div>
                <div className="mt-1 text-lg font-semibold text-zinc-900">
                  {session.username}
                </div>
              </div>
              <DashboardSignOutButton className="w-auto border-zinc-200 bg-white px-4 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900" />
            </div>

            <div className="mt-5">
              <DashboardNav mobile />
            </div>
          </div>

          <div className="flex-1 rounded-[32px] border border-zinc-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] md:p-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
