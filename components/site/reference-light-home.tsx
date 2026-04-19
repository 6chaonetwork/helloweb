import Image from "next/image";
import Link from "next/link";
import {
  Apple,
  ArrowRight,
  Bot,
  Download,
  HardDriveDownload,
  Layers3,
  Monitor,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const topLinks = [
  { href: "/product", label: "产品能力" },
  { href: "/deployment", label: "部署路径" },
  { href: "/contact", label: "合作与接入" },
] as const;

const highlights: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}> = [
  {
    title: "多模型 API 管理",
    description: "统一管理模型提供商、账号配置和调用能力，减少工作区里的配置分散。",
    icon: Layers3,
  },
  {
    title: "共享员工市场",
    description: "将智能体、工作模版和工作流沉淀成团队可复用资产，形成统一入口。",
    icon: Bot,
    badge: "全生态",
  },
  {
    title: "安全本地执行",
    description: "尽量本地承接核心能力，更适合长期使用、隐私和受控执行场景。",
    icon: HardDriveDownload,
    badge: "ONLINE",
  },
];

const showcaseCards = [
  {
    title: "消息频道与账号关系",
    description: "频道、默认账号、绑定关系和支持平台统一收在一个页面里。",
    image: "/official/channels.png",
    className: "shot-sway-left",
  },
  {
    title: "模型与提供商中心",
    description: "把 provider、模型和使用情况放在同一层产品逻辑中。",
    image: "/official/models.png",
    className: "shot-float",
  },
  {
    title: "技能与工作流自动化",
    description: "技能市场、自动化任务与记忆能力构成完整的工作流结构。",
    image: "/official/skills.png",
    className: "shot-sway-right",
  },
  {
    title: "记忆与本地工作区",
    description: "让记忆、上下文和执行过程都沉淀到真实工作区能力里。",
    image: "/official/memory.png",
    className: "shot-float",
  },
];

export function ReferenceLightHome() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f5f3ee_0%,#f7f5f1_100%)] px-4 py-6 text-[#111827] md:px-8 md:py-10">
      <div className="mx-auto max-w-[1460px]">
        <div className="overflow-hidden rounded-[32px] border border-black/10 bg-[linear-gradient(180deg,#faf9f7,#f5f2eb)] shadow-[0_40px_120px_rgba(17,24,39,0.14)]">
          <div className="grid items-center gap-4 border-b border-black/8 px-5 py-3 md:grid-cols-[220px_minmax(0,1fr)_220px]">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff6b61]" />
              <span className="h-3 w-3 rounded-full bg-[#f7bf4f]" />
              <span className="h-3 w-3 rounded-full bg-[#45c26b]" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-sm">
              <div className="flex items-center gap-2 font-semibold text-[#111827]">
                <Image
                  src="/brand/helloclaw-logo.png"
                  alt="HelloClaw"
                  width={22}
                  height={22}
                  className="h-5 w-5 rounded-md object-cover"
                />
                <span>HelloClaw</span>
              </div>
              {topLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[#4b5563] transition hover:text-[#111827]"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-end gap-5 text-sm">
              <div className="flex items-center gap-2 text-[#6b7280]">
                <span>ONLINE</span>
                <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
              </div>
              <div className="text-[#6b7280]">v0.1.13</div>
            </div>
          </div>

          <div className="px-5 pb-8 pt-10 md:px-10 lg:px-14">
            <div className="mx-auto max-w-5xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-medium text-red-500">
                <Sparkles size={14} />
                <span>正式产品官网提案 · 浅色窗口版</span>
              </div>
              <h1 className="mt-7 whitespace-nowrap text-4xl font-semibold leading-tight tracking-[-0.055em] text-[#0f172a] md:text-[4.2rem] md:leading-[1.05]">
                HelloClaw：你的全能 AI 代理行动中心
              </h1>
              <p className="mx-auto mt-5 max-w-4xl text-[1.15rem] leading-8 text-[#374151] md:text-[1.45rem] md:leading-[1.65]">
                控制 · 执行 · 安全 · 无代码。你的 24 小时 AI 本地代理与工作区入口。
              </p>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-[#6b7280] md:text-lg">
                Control. Execution. Security. No Code. Your 24-Hour AI Local Agent.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 md:flex-row">
                <Link
                  href="/"
                  className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-xl border border-red-300/30 bg-[#ef4444] px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(239,68,68,0.22)] transition hover:-translate-y-0.5"
                >
                  <Apple size={18} />
                  <span>Mac 客户端下载</span>
                </Link>
                <Link
                  href="/"
                  className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-[#111827] transition hover:-translate-y-0.5 hover:bg-[#f8fafc]"
                >
                  <Monitor size={18} />
                  <span>Windows 客户端下载</span>
                </Link>
                <Link
                  href="/"
                  className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-xl border border-black/10 bg-[#111827] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  <Download size={18} />
                  <span>Linux 客户端下载</span>
                </Link>
              </div>
            </div>

            <div className="mx-auto mt-10 max-w-[1030px]">
              <div className="overflow-hidden rounded-[22px] border border-black/12 bg-[#0d1220] shadow-[0_35px_80px_rgba(17,24,39,0.18)]">
                <div className="flex items-center justify-between border-b border-white/8 px-4 py-3 text-sm text-white/50">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#ff6b61]" />
                    <span className="h-3 w-3 rounded-full bg-[#f7bf4f]" />
                    <span className="h-3 w-3 rounded-full bg-[#45c26b]" />
                  </div>
                  <span>HelloClaw</span>
                  <div className="flex items-center gap-2">
                    <span>ONLINE</span>
                    <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
                  </div>
                </div>
                <Image
                  src="/official/chat-home.png"
                  alt="HelloClaw main workspace"
                  width={1440}
                  height={920}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-[1030px] border-t border-black/8 pt-5">
              <div className="grid gap-4 md:grid-cols-3">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-[18px] border border-black/8 bg-white px-5 py-5 shadow-[0_16px_34px_rgba(17,24,39,0.07)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl border border-black/8 bg-[#f3f4f6] text-[#111827]">
                          <Icon size={18} />
                        </div>
                        {item.badge ? (
                          <span
                            className={cn(
                              "rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                              item.badge === "ONLINE"
                                ? "bg-red-50 text-red-500"
                                : "bg-[#fff2f2] text-[#ef4444]",
                            )}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-4 text-[1.15rem] font-semibold text-[#111827]">
                        {item.title}
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[#4b5563]">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-[1030px] grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <div className="overflow-hidden rounded-[20px] border border-black/8 bg-white shadow-[0_18px_40px_rgba(17,24,39,0.07)]">
                <div className="border-b border-black/8 px-5 py-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-[#9ca3af]">
                    真实场景，即刻体验
                  </div>
                  <div className="mt-2 text-xl font-semibold text-[#111827]">
                    用你们自己的真实界面来展示 HelloClaw
                  </div>
                </div>
                <div className="grid gap-4 p-4 md:grid-cols-2">
                  {showcaseCards.slice(0, 2).map((item) => (
                    <div key={item.title} className={cn("space-y-3", item.className)}>
                      <div className="overflow-hidden rounded-[16px] border border-black/8 bg-[#0e1320]">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={900}
                          height={760}
                          className="h-auto w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#111827]">{item.title}</div>
                        <div className="mt-1 text-sm text-[#6b7280]">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[20px] border border-black/8 bg-[#111827] text-white shadow-[0_18px_40px_rgba(17,24,39,0.10)]">
                <div className="border-b border-white/8 px-5 py-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/45">
                    Product Direction
                  </div>
                  <div className="mt-2 text-xl font-semibold">从工作区入口走向完整控制面</div>
                </div>
                <div className="grid gap-3 p-5">
                  {[
                    "桌面工作区负责承接日常使用体验",
                    "频道与身份链路负责连接消息入口与用户状态",
                    "控制台负责运营配置和未来 HelloAPI 接入",
                    "官网负责讲清楚产品，而不是只做一页下载页",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4 text-sm leading-7 text-white/72"
                    >
                      <div className="mb-1 text-xs uppercase tracking-[0.18em] text-white/35">
                        0{index + 1}
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-[1030px] rounded-[22px] border border-black/8 bg-white px-6 py-6 shadow-[0_18px_40px_rgba(17,24,39,0.07)]">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-3xl">
                  <div className="text-xs uppercase tracking-[0.24em] text-[#9ca3af]">
                    Next Step
                  </div>
                  <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#111827]">
                    这版已经更接近正式官网成品，下一步就是继续把它收成主版本。
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#4b5563]">
                    它比“参考图翻译版”更像真正的软件官网，也更适合继续承接产品页、部署页和后续后台接入。
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/product"
                    className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    查看产品页
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/qclaw-preview"
                    className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:-translate-y-0.5"
                  >
                    查看旧参考版
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
