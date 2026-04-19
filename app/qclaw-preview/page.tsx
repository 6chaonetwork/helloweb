import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  CheckCircle2,
  Command,
  LayoutDashboard,
  QrCode,
  type LucideIcon,
} from "lucide-react";
import { ShotCard } from "@/components/site/shot-card";
import { SiteSection } from "@/components/site/site-section";
import { SiteShell } from "@/components/site/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const navFeatures: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: Command,
    title: "桌面工作区",
    description: "把 Agent、会话、技能和工具使用整合进真正可用的桌面端产品体验。",
  },
  {
    icon: Blocks,
    title: "模型与账号接入",
    description: "统一管理模型提供商、账号配置和工作区能力，不再分散维护。",
  },
  {
    icon: QrCode,
    title: "频道与身份链路",
    description: "承接消息频道、扫码登录、设备绑定和用户状态，形成完整链路。",
  },
  {
    icon: LayoutDashboard,
    title: "运营控制台",
    description: "为配置、运营和后续 HelloAPI admin API 对接提供正式控制面。",
  },
];

const experienceItems = [
  {
    title: "消息频道，统一接入",
    description:
      "频道、账号、绑定关系和默认入口放在一个页面里，结构更像正式后台而不是工具配置页。",
    image: "/official/channels.png",
    className: "shot-sway-left",
  },
  {
    title: "模型提供商，统一管理",
    description:
      "从 provider 到模型使用情况都能放进同一层产品逻辑，减少配置分散。",
    image: "/official/models.png",
    className: "shot-float",
  },
  {
    title: "技能与自动化，形成工作流",
    description:
      "技能市场、定时任务、记忆能力不再是附加项，而是工作流本身的一部分。",
    image: "/official/skills.png",
    className: "shot-sway-right",
  },
];

const steps = [
  {
    step: "01",
    title: "安装并进入工作区",
    description:
      "HelloClaw 先承担桌面端入口，让团队先真正使用起来，再考虑更复杂的系统接入。",
  },
  {
    step: "02",
    title: "配置模型、频道与工作流",
    description:
      "把模型、技能、频道、记忆和自动化放进统一界面，减少工具切换成本。",
  },
  {
    step: "03",
    title: "继续扩展到控制台与外部系统",
    description:
      "前台稳定后，再通过控制台和服务端代理逐步接入 HelloAPI 与商业化数据。",
  },
];

const scenarioCards = [
  "团队内部 AI 工作台",
  "正式产品交付与官网入口",
  "消息频道与扫码登录链路",
  "后续账号、余额、Key 与订单承接",
];

export default function QclawPreviewPage() {
  return (
    <SiteShell current="home">
      <main>
        <section className="site-section pb-12 pt-12 md:pb-16 md:pt-16">
          <div className="site-container">
            <div className="grid gap-12 xl:grid-cols-[minmax(0,0.96fr)_minmax(520px,1.04fr)] xl:items-center">
              <div className="max-w-3xl">
                <Badge variant="outline" className="border-black/8 bg-white text-[#4b5563]">
                  HelloClaw Official
                </Badge>
                <h1 className="mt-6 text-balance text-5xl font-semibold leading-none tracking-[-0.06em] text-[#111827] md:text-7xl">
                  把 HelloClaw 做成
                  <br />
                  真正能进入团队、
                  <br />
                  能继续接系统的产品。
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-9 text-[#4b5563]">
                  HelloClaw 不是单一界面，也不是上游能力的临时壳层。它应该同时承接桌面工作区、
                  频道与身份链路、运营控制台，以及未来 HelloAPI 的管理接口接入。
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href="/product">
                      产品能力
                      <ArrowRight size={16} />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/deployment">部署路径</Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost">
                    <Link href="/contact">合作与接入</Link>
                  </Button>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-2">
                  {scenarioCards.map((item) => (
                    <div
                      key={item}
                      className="rounded-[22px] border border-black/8 bg-white px-4 py-4 text-sm text-[#374151] shadow-[0_14px_30px_rgba(17,24,39,0.05)]"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="mt-1 shrink-0 text-[#16a34a]" />
                        <span>{item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-5">
                <ShotCard
                  src="/official/chat-home.png"
                  alt="HelloClaw chat workspace"
                  title="Workspace"
                  eyebrow="主工作区"
                  description="以你们自己的正式版界面作为首页主视觉，而不是上游截图。"
                />
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-[28px] border border-black/8 bg-white p-5 shadow-[0_18px_40px_rgba(17,24,39,0.06)]">
                    <div className="text-xs uppercase tracking-[0.28em] text-[#9ca3af]">
                      Product Focus
                    </div>
                    <div className="mt-4 text-2xl font-semibold text-[#111827]">
                      工作区、频道、控制台
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[#4b5563]">
                      先把产品结构做对，再去做更复杂的系统连接和商业化后台。
                    </p>
                  </div>
                  <div className="rounded-[28px] border border-black/8 bg-[#111827] p-5 text-white shadow-[0_18px_40px_rgba(17,24,39,0.10)]">
                    <div className="text-xs uppercase tracking-[0.28em] text-white/45">
                      Current State
                    </div>
                    <div className="mt-4 text-2xl font-semibold">正式前台先成型</div>
                    <p className="mt-3 text-sm leading-7 text-white/70">
                      后台与 HelloAPI 接入可以继续做，但前台官网必须先成为可信入口。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SiteSection
          eyebrow="功能优势"
          title="把核心能力放在同一条产品线上组织"
          description="这部分会更接近你给的参考站节奏，但内容、结构和产品边界全部换成 HelloClaw 自己的。"
        >
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
            {navFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="border-black/8 bg-white shadow-[0_18px_40px_rgba(17,24,39,0.06)]"
                >
                  <CardContent className="p-6">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-black/8 bg-[#f3f4f6] text-[#111827]">
                      <Icon size={18} />
                    </div>
                    <h2 className="mt-5 text-2xl font-semibold text-[#111827]">{item.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-[#4b5563]">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </SiteSection>

        <SiteSection
          eyebrow="快速上手"
          title="先让团队用起来，再继续往后台和外部系统扩"
          description="这部分会更像产品官网，而不是模板式介绍页。"
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {steps.map((item) => (
              <Card
                key={item.step}
                className="border-black/8 bg-white shadow-[0_18px_40px_rgba(17,24,39,0.06)]"
              >
                <CardContent className="p-6">
                  <div className="text-xs uppercase tracking-[0.28em] text-[#9ca3af]">
                    Step {item.step}
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-[#111827]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#4b5563]">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </SiteSection>

        <SiteSection
          eyebrow="真实场景，即刻体验"
          title="用你们自己的真实界面来展示产品，而不是再借上游截图"
          description="下面这一组全部换成 HelloClaw 自己的正式版界面，并加轻微晃动效果，先试一版节奏。"
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] xl:items-start">
            <div className="grid gap-6">
              <ShotCard
                src="/official/channels.png"
                alt="HelloClaw channels page"
                title="Channels"
                eyebrow={experienceItems[0].title}
                description={experienceItems[0].description}
                className={experienceItems[0].className}
              />
              <ShotCard
                src="/official/agents.png"
                alt="HelloClaw agents page"
                title="Agents"
                eyebrow="智能体组织"
                description="从 Main Agent 到多个工作智能体，更接近完整团队工作区。"
                className="shot-float"
              />
            </div>
            <div className="grid gap-6 pt-4 xl:pt-12">
              <ShotCard
                src="/official/models.png"
                alt="HelloClaw models page"
                title="Models"
                eyebrow={experienceItems[1].title}
                description={experienceItems[1].description}
                className={experienceItems[1].className}
              />
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
                <ShotCard
                  src="/official/skills.png"
                  alt="HelloClaw skills page"
                  title="Skills"
                  eyebrow={experienceItems[2].title}
                  description={experienceItems[2].description}
                  className="shot-sway-right"
                  compact
                />
                <ShotCard
                  src="/official/memory.png"
                  alt="HelloClaw memory page"
                  title="Memory"
                  eyebrow="记忆实验室"
                  description="把记忆能力沉淀到产品结构里，而不只是对话的一部分。"
                  className="shot-sway-left"
                  compact
                />
              </div>
            </div>
          </div>
        </SiteSection>

        <section className="site-section pb-18 pt-4 md:pb-24">
          <div className="site-container">
            <Card className="border-black/8 bg-[#111827] text-white shadow-[0_30px_80px_rgba(17,24,39,0.16)]">
              <CardContent className="p-8 md:p-10">
                <div className="max-w-4xl">
                  <div className="text-xs uppercase tracking-[0.28em] text-white/45">
                    Next Step
                  </div>
                  <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
                    这版先把 QClaw 的结构感借过来，再完全换成 HelloClaw 自己的产品内容和真实界面。
                  </h2>
                  <p className="mt-4 text-base leading-8 text-white/70">
                    如果这一版方向对，我们下一轮就继续把产品页和场景页往同一个节奏上拉齐。
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href="/product">
                      查看产品页
                      <ArrowRight size={16} />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/14 bg-transparent text-white hover:bg-white/8"
                  >
                    <Link href="/editorial">查看保留版首页</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
