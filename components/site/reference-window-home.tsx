import Image from "next/image";
import Link from "next/link";
import {
  Blocks,
  Bot,
  Download,
  HardDriveDownload,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark";

type FeatureCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  tone?: "default" | "alert";
};

const featureCards: FeatureCard[] = [
  {
    title: "多模型 API 管理",
    description: "统一管理模型提供商、账号与调用配置，减少工作区里的模型与账号分散。",
    icon: Blocks,
  },
  {
    title: "共享员工市场",
    description: "把智能体、工作模版和工作流沉淀成团队可复用资产，形成统一入口。",
    icon: Bot,
    badge: "全生态",
  },
  {
    title: "安全本地执行",
    description: "核心能力尽量本地承接，更适合长期使用、隐私和受控执行场景。",
    icon: HardDriveDownload,
    badge: "ONLINE",
    tone: "alert",
  },
];

type ImageCard = {
  title: string;
  subtitle: string;
  image: string;
  className?: string;
};

const imageCards: ImageCard[] = [
  {
    title: "MULTIPLEX CHANNEL CONTROL",
    subtitle: "消息频道统一接入",
    image: "/official/channels.png",
    className: "shot-sway-left",
  },
  {
    title: "UNIFIED MODEL CENTER",
    subtitle: "模型与账号管理中心",
    image: "/official/models.png",
    className: "shot-float",
  },
  {
    title: "LOCAL MEMORY & PRIVACY",
    subtitle: "记忆与本地执行能力",
    image: "/official/memory.png",
    className: "shot-sway-right",
  },
  {
    title: "SKILLS & AUTOMATION",
    subtitle: "技能与工作流自动化",
    image: "/official/skills.png",
    className: "shot-float",
  },
];

export function ReferenceWindowHome({ mode }: { mode: ThemeMode }) {
  const dark = mode === "dark";

  return (
    <main
      className={cn(
        "min-h-screen px-4 py-6 md:px-8 md:py-10",
        dark
          ? "bg-[radial-gradient(circle_at_top,rgba(255,70,70,0.10),transparent_14%),linear-gradient(180deg,#060816,#090b14)] text-white"
          : "bg-[radial-gradient(circle_at_top,rgba(17,24,39,0.05),transparent_18%),linear-gradient(180deg,#f4f2ee,#f8f7f4)] text-[#111827]",
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-[1420px] overflow-hidden rounded-[28px] border shadow-[0_30px_80px_rgba(17,24,39,0.16)]",
          dark
            ? "border-white/8 bg-[linear-gradient(180deg,rgba(11,13,22,0.98),rgba(7,9,17,0.98))]"
            : "border-black/10 bg-[linear-gradient(180deg,#faf9f7,#f6f4ef)]",
        )}
      >
        <div
          className={cn(
            "grid items-center gap-4 border-b px-5 py-3 md:grid-cols-[220px_minmax(0,1fr)_220px]",
            dark ? "border-white/8" : "border-black/8",
          )}
        >
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff6b61]" />
            <span className="h-3 w-3 rounded-full bg-[#f7bf4f]" />
            <span className="h-3 w-3 rounded-full bg-[#45c26b]" />
          </div>

          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <Image
                src="/brand/helloclaw-logo.png"
                alt="HelloClaw"
                width={22}
                height={22}
                className="h-5 w-5 rounded-md object-cover"
              />
              <span>HelloClaw</span>
            </div>
            <span className={cn(dark ? "text-white/65" : "text-[#4b5563]")}>Docs</span>
            <span className={cn(dark ? "text-white/65" : "text-[#4b5563]")}>API</span>
            <span className={cn(dark ? "text-white/65" : "text-[#4b5563]")}>Pricing</span>
          </div>

          <div className="flex items-center justify-end gap-6 text-sm">
            <div className={cn("flex items-center gap-2", dark ? "text-white/55" : "text-[#6b7280]")}>
              <span>ONLINE</span>
              <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
            </div>
            <div className="flex items-center gap-2 font-medium">
              <Image
                src="/brand/helloclaw-logo.png"
                alt="HelloClaw"
                width={18}
                height={18}
                className="h-4 w-4 rounded-sm object-cover"
              />
              <span className={cn(dark ? "text-white/80" : "text-[#374151]")}>Text-logo</span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-8 pt-8 md:px-10 md:pt-10">
          <div className="mx-auto max-w-5xl text-center">
            <h1
              className={cn(
                "text-balance text-4xl font-semibold leading-tight tracking-[-0.05em] md:text-[4.1rem]",
                dark ? "text-white" : "text-[#0f172a]",
              )}
            >
              HelloClaw: 你的全能 AI 代理行动中心
            </h1>
            <p
              className={cn(
                "mx-auto mt-4 max-w-4xl text-lg leading-8 md:text-[1.75rem] md:leading-[1.45]",
                dark ? "text-white/72" : "text-[#374151]",
              )}
            >
              控制 · 执行 · 安全 · 无代码。你的 24 小时 AI 本地代理与工作区入口。
            </p>
            <p
              className={cn(
                "mx-auto mt-3 max-w-3xl text-base leading-7 md:text-xl",
                dark ? "text-white/50" : "text-[#6b7280]",
              )}
            >
              Control. Execution. Security. No Code. Your 24-Hour AI Local Agent.
            </p>

            <div className="mt-7 flex justify-center">
              <Link
                href="/"
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-[0_18px_40px_rgba(239,68,68,0.18)] transition hover:-translate-y-0.5",
                  dark
                    ? "border border-red-300/20 bg-[#ef4444] text-white"
                    : "border border-red-300/24 bg-[#ef4444] text-white",
                )}
              >
                <Download size={18} />
                <span>下载桌面端（v0.1.13）</span>
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-[980px]">
            <div
              className={cn(
                "overflow-hidden rounded-[20px] border shadow-[0_30px_70px_rgba(17,24,39,0.18)]",
                dark ? "border-white/10 bg-[#0b101b]" : "border-black/10 bg-[#0e1320]",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-between border-b px-4 py-3 text-sm",
                  dark ? "border-white/8 bg-white/4 text-white/45" : "border-white/8 bg-white/6 text-white/55",
                )}
              >
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
                width={1400}
                height={880}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>

          {dark ? (
            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {imageCards.map((item) => (
                <div
                  key={item.title}
                  className={cn(
                    "rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(19,24,45,0.94),rgba(10,14,27,0.96))] p-4 shadow-[0_0_30px_rgba(168,85,247,0.08)]",
                    item.className,
                  )}
                >
                  <div className="mb-3 text-lg font-medium tracking-[0.02em] text-white/90">
                    {item.title}
                  </div>
                  <div className="overflow-hidden rounded-[16px] border border-white/10 bg-black/20">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={900}
                      height={760}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/62">{item.subtitle}</p>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={cn(
                "mx-auto mt-8 max-w-[980px] border-t pt-5",
                dark ? "border-white/8" : "border-black/8",
              )}
            >
              <div className="grid gap-4 md:grid-cols-3">
                {featureCards.map((item) => {
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
                              item.tone === "alert"
                                ? "bg-red-50 text-red-500"
                                : "bg-[#fff2f2] text-[#ef4444]",
                            )}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-[1.15rem] font-semibold text-[#111827]">
                        <span>{item.title}</span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[#4b5563]">{item.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="overflow-hidden rounded-[18px] border border-black/8 bg-white shadow-[0_16px_34px_rgba(17,24,39,0.07)]">
                  <div className="border-b border-black/8 px-5 py-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-[#9ca3af]">
                      场景展示
                    </div>
                    <div className="mt-2 text-xl font-semibold text-[#111827]">
                      消息频道与智能体工作区
                    </div>
                  </div>
                  <div className="grid gap-4 p-4 md:grid-cols-2">
                    {imageCards.slice(0, 2).map((item) => (
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
                          <div className="mt-1 text-sm text-[#6b7280]">{item.subtitle}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-[18px] border border-black/8 bg-[#111827] text-white shadow-[0_16px_34px_rgba(17,24,39,0.10)]">
                  <div className="border-b border-white/8 px-5 py-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/45">
                      Product Direction
                    </div>
                    <div className="mt-2 text-xl font-semibold">
                      从工作区入口走向完整控制面
                    </div>
                  </div>
                  <div className="grid gap-3 p-5">
                    {[
                      "桌面工作区负责承接日常使用体验",
                      "渠道与身份链路负责连接消息与用户状态",
                      "控制台负责运营配置和未来 HelloAPI 接入",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4 text-sm leading-7 text-white/72"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
