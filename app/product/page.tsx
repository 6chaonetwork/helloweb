import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  Bot,
  Cable,
  LayoutDashboard,
  QrCode,
  Shield,
  TimerReset,
  type LucideIcon,
} from "lucide-react";
import { SiteSection } from "@/components/site/site-section";
import { ShotCard } from "@/components/site/shot-card";
import { SiteShell } from "@/components/site/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "产品能力",
  description: "了解 HelloClaw 的桌面工作区、接入层、控制台与后续外部系统对接方向。",
};

const pillars: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: Bot,
    title: "桌面工作区",
    description:
      "承接会话、技能与工具执行，让团队使用 Agent 时不必依赖终端或零散脚本。",
  },
  {
    icon: Blocks,
    title: "统一接入层",
    description:
      "围绕模型、账号、渠道与身份链路建立统一管理面，而不是每个环节各自单独配置。",
  },
  {
    icon: QrCode,
    title: "扫码与身份链路",
    description:
      "通过二维码 challenge、设备绑定和用户状态沉淀，形成真正可管理的身份链路。",
  },
  {
    icon: LayoutDashboard,
    title: "控制台",
    description:
      "统一承接渠道、用户、公告、远程配置，以及后续 HelloAPI 管理接口对接。",
  },
];

const realCapabilities = [
  {
    eyebrow: "Desktop",
    title: "桌面端不是附属页，而是正式工作入口",
    description:
      "HelloClaw 的价值之一，是把原本面向少数终端用户的能力提升成可被团队反复使用的桌面产品体验。",
    bullets: ["多会话与上下文", "Skill 与工具", "适合团队交付的界面结构"],
  },
  {
    eyebrow: "Channel",
    title: "渠道配置和扫码登录属于真正的产品能力",
    description:
      "公众号参数、回调地址、二维码登录、用户设备状态这些都不是临时脚本，它们应该属于正式后台的一部分。",
    bullets: ["公众号配置", "挑战状态跟踪", "设备与会话沉淀"],
  },
  {
    eyebrow: "Operations",
    title: "控制台要为后续系统打通预留位置",
    description:
      "既然你后面要接 HelloAPI，那控制台就必须一开始就是‘可继续长’的结构，而不是临时配置页集合。",
    bullets: ["公告与 onboarding", "用户与渠道后台", "余额 / Key / 订单预留位"],
  },
];

const reasons = [
  {
    icon: Shield,
    title: "更像真实软件产品",
    description: "官网、桌面端和后台属于同一产品，而不是三块风格割裂的页面。",
  },
  {
    icon: Cable,
    title: "更适合接外部系统",
    description: "后续接 HelloAPI 或其他后台时，不需要再重做官网和控制台承载层。",
  },
  {
    icon: TimerReset,
    title: "更适合持续迭代",
    description: "先把产品骨架搭正，后面再补真实截图、数据和业务模块，返工最少。",
  },
];

export default function ProductPage() {
  return (
    <SiteShell current="product">
      <main>
        <section className="site-section py-14 md:py-18">
          <div className="site-container">
            <Badge variant="outline" className="border-black/8 bg-white text-[#4b5563]">
              Product Capability
            </Badge>
            <h1 className="mt-6 max-w-5xl text-balance text-5xl font-semibold leading-none tracking-[-0.06em] text-[#111827] md:text-7xl">
              这一页不靠错误截图，而是先把 HelloClaw 的真实产品边界讲清楚。
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-9 text-[#4b5563]">
              现在更重要的是让人理解 HelloClaw 到底是什么、已经在做什么、后面会怎么接
              HelloAPI，而不是塞一堆看起来很“像 AI 产品”的装饰性页面元素。
            </p>
          </div>
        </section>

        <SiteSection
          eyebrow="Four Parts"
          title="HelloClaw 当前最重要的四个产品部分"
          description="这四部分决定了它不是单点工具，而是一套可以继续往产品化推进的系统。"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {pillars.map((item) => {
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
          eyebrow="Real Scope"
          title="现在官网应该诚实表达的内容"
          description="先说清楚系统结构和模块职责，比放一堆不属于你们版本的图片更有价值。"
        >
          <div className="grid gap-5">
            {realCapabilities.map((item) => (
              <Card
                key={item.title}
                className="border-black/8 bg-white shadow-[0_18px_40px_rgba(17,24,39,0.06)]"
              >
                <CardContent className="p-6">
                  <div className="text-xs uppercase tracking-[0.28em] text-[#9ca3af]">
                    {item.eyebrow}
                  </div>
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#111827]">
                    {item.title}
                  </h2>
                  <p className="mt-4 text-sm leading-8 text-[#4b5563]">{item.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className="rounded-full border border-black/8 bg-[#f7f7f5] px-4 py-2 text-sm text-[#374151]"
                      >
                        {bullet}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <ShotCard
              src="/official/chat-home.png"
              alt="HelloClaw chat workspace"
              title="Workspace"
              eyebrow="真实界面"
              description="用你们自己的正式版工作区界面说明产品，而不是拿上游图凑展示区。"
            />
            <ShotCard
              src="/official/agents.png"
              alt="HelloClaw agents page"
              title="Agents"
              eyebrow="组织与配置"
              description="智能体页比抽象文案更能说明 HelloClaw 的产品边界。"
            />
          </div>
        </SiteSection>

        <SiteSection
          eyebrow="Why This Direction"
          title="为什么现在先这样做更对"
          description="因为你下一步不是换皮，而是要继续接后台、接账号体系、接订单和销售数据。"
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {reasons.map((item) => {
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
                    <h3 className="mt-5 text-2xl font-semibold text-[#111827]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#4b5563]">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
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
                    下一步继续看部署路径，会更接近你后面真正要推进的 HelloAPI 对接。
                  </h2>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href="/deployment">
                      查看部署路径
                      <ArrowRight size={16} />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/14 bg-transparent text-white hover:bg-white/8"
                  >
                    <Link href="/login">进入后台</Link>
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
