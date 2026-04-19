import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  Building2,
  Cable,
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

const productLayers: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: Command,
    title: "桌面工作区",
    description:
      "承接会话、模型、技能、记忆和自动化，让团队使用 HelloClaw 时像在用真正的软件，而不是命令行壳层。",
  },
  {
    icon: QrCode,
    title: "渠道与身份链路",
    description:
      "围绕消息频道、扫码登录、设备绑定和用户状态形成完整链路，为后续平台化演进打底。",
  },
  {
    icon: LayoutDashboard,
    title: "控制台与接入层",
    description:
      "负责配置、运营和未来外部系统对接，后续 HelloAPI 的余额、Key、订单与销售数据也会落在这里。",
  },
];

const capabilityRows = [
  {
    title: "消息频道与账号绑定",
    description:
      "把频道、默认账号、绑定关系和支持平台统一放到一个页面里，结构比一般的 AI 工具更接近正式运营后台。",
  },
  {
    title: "模型与提供商管理",
    description:
      "把 provider、模型、账号和近期使用情况放在同一个操作面里，方便团队统一维护。",
  },
  {
    title: "技能、记忆与自动化",
    description:
      "不是只有聊天入口，而是把 Skills、记忆实验室和定时任务纳入完整工作流。",
  },
];

const scenarios = [
  {
    icon: Building2,
    title: "团队内部工作台",
    description:
      "适合希望把 AI 使用从个人命令行提升到团队统一工作界面的团队。",
  },
  {
    icon: Blocks,
    title: "正式产品交付",
    description:
      "适合既要桌面端、又要官网和后台入口的产品型交付方式。",
  },
  {
    icon: Cable,
    title: "商业化后台承接",
    description:
      "适合后续接入 HelloAPI，把账户、余额、Key、订单和销售统计统一纳入控制台。",
  },
];

const roadmap = [
  {
    step: "01",
    title: "官网与前台先成型",
    description: "先把正式官网、产品页和部署页做稳，建立清楚的产品入口。",
  },
  {
    step: "02",
    title: "控制台承接配置与运营",
    description: "后台继续承接渠道、用户、公告与 onboarding 这些产品管理能力。",
  },
  {
    step: "03",
    title: "再接 HelloAPI",
    description: "等前台和控制台形态稳定后，再通过服务端代理接独立运行的 HelloAPI。",
  },
];

export default function HomePage() {
  return (
    <SiteShell current="home">
      <main>
        <section className="site-section pb-14 pt-12 md:pb-18 md:pt-16">
          <div className="site-container grid gap-10 xl:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)] xl:items-center">
            <div className="max-w-4xl">
              <Badge variant="outline" className="border-black/8 bg-white text-[#4b5563]">
                HelloClaw Official
              </Badge>
              <h1 className="mt-6 text-balance text-5xl font-semibold leading-none tracking-[-0.06em] text-[#111827] md:text-7xl xl:text-[5.6rem]">
                让 HelloClaw 成为一套
                <br />
                真正能对外展示、
                <br />
                能继续接系统的产品。
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-9 text-[#4b5563]">
                HelloClaw 不只是桌面界面，也不只是上游能力的壳。它应该同时承接
                工作区体验、渠道与身份链路、运营控制台，以及后续 HelloAPI
                的管理接口接入。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/product">
                    查看产品能力
                    <ArrowRight size={16} />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/deployment">查看部署路径</Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link href="/contact">合作与接入</Link>
                </Button>
              </div>
            </div>

            <ShotCard
              src="/official/chat-home.png"
              alt="HelloClaw chat workspace"
              title="Workspace"
              eyebrow="Real product screen"
              description="首页主视觉直接使用你们自己的正式版本界面，不再使用任何上游截图。"
            />
          </div>
        </section>

        <SiteSection
          eyebrow="Product Structure"
          title="先把产品结构讲清楚，再谈接入和商业化"
          description="这三层结构决定了 HelloClaw 为什么不是单点工具，而是一套可以继续产品化推进的系统。"
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {productLayers.map((item) => {
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
          eyebrow="Core Areas"
          title="HelloClaw 现在最值得拿出来讲的，不是概念，而是这些真实页面"
          description="我会用你们自己的界面图，把产品能力放在具体页面上解释，而不是做成一堆模板式功能卡片。"
        >
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
            <ShotCard
              src="/official/channels.png"
              alt="HelloClaw channels page"
              title="Channels"
              eyebrow="渠道与账号关系"
              description={capabilityRows[0].description}
            />
            <div className="grid gap-5">
              <ShotCard
                src="/official/models.png"
                alt="HelloClaw models page"
                title="Models"
                eyebrow="模型与 provider"
                description={capabilityRows[1].description}
                compact
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <ShotCard
                  src="/official/skills.png"
                  alt="HelloClaw skills page"
                  title="Skills"
                  compact
                  className="h-full"
                />
                <ShotCard
                  src="/official/memory.png"
                  alt="HelloClaw memory page"
                  title="Memory"
                  compact
                  className="h-full"
                />
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <ShotCard
              src="/official/agents.png"
              alt="HelloClaw agents page"
              title="Agents"
              eyebrow="智能体组织"
              description="更像团队工作区，而不是只有一个聊天框。"
            />
            <ShotCard
              src="/official/cron.png"
              alt="HelloClaw cron page"
              title="Cron"
              eyebrow="定时任务"
              description={capabilityRows[2].description}
            />
          </div>
        </SiteSection>

        <SiteSection
          eyebrow="Who It Fits"
          title="更适合什么样的团队和产品阶段"
          description="官网不该只展示功能，而应该让人一眼判断 HelloClaw 是否适合自己。"
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {scenarios.map((item) => {
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

        <SiteSection
          eyebrow="Roadmap"
          title="对你现在最合适的推进顺序"
          description="先让前台成型，再让后台和外部系统逐步接入。这样快，也稳。"
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {roadmap.map((item) => (
              <Card
                key={item.step}
                className="border-black/8 bg-white shadow-[0_18px_40px_rgba(17,24,39,0.06)]"
              >
                <CardContent className="p-6">
                  <div className="text-xs uppercase tracking-[0.28em] text-[#9ca3af]">
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-[#111827]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#4b5563]">{item.description}</p>
                </CardContent>
              </Card>
            ))}
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
                    前台正式站先做出来，下一步再顺势承接后台和 HelloAPI。
                  </h2>
                  <p className="mt-4 text-base leading-8 text-white/70">
                    这次官网将只使用你们自己的正式版截图和素材，不再引用上游版本，也不再走模板式
                    AI 官网的视觉路线。
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
                    <Link href="/deployment">查看部署路径</Link>
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
