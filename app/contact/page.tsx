import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  DatabaseZap,
  KeyRound,
  type LucideIcon,
} from "lucide-react";
import { SiteSection } from "@/components/site/site-section";
import { SiteShell } from "@/components/site/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "合作与接入",
  description: "查看 HelloClaw 在企业交付、系统打通和商业化后台承接方向上的合作与接入建议。",
};

const tracks: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: Building2,
    title: "企业内部部署",
    description: "适合需要桌面工作区、后台管理和统一入口的企业或团队场景。",
  },
  {
    icon: DatabaseZap,
    title: "独立系统打通",
    description: "适合已经部署 HelloAPI 或其他后台服务，希望通过 HelloClaw 统一承接入口与控制面的场景。",
  },
  {
    icon: ChartNoAxesCombined,
    title: "商业化后台承接",
    description: "适合后续接余额、Key、充值订单和销售统计，形成正式运营后台。",
  },
];

const scope = [
  "官方官网首页与产品页",
  "正式登录页和控制台壳层",
  "渠道、用户、公告与 onboarding 后台",
  "HelloAPI admin API 的代理接入",
  "账户、余额、Key、订单与销售看板",
];

const advice = [
  {
    icon: BriefcaseBusiness,
    title: "如果你现在最急的是上线",
    description: "那就先把官网和后台做成正式版本，不要在截图和风格上继续做看起来很像 AI 模板的东西。",
  },
  {
    icon: KeyRound,
    title: "如果你已经有 HelloAPI 服务",
    description: "建议继续让它独立运行，HelloClaw 只负责官网、控制台和管理接口代理层。",
  },
];

export default function ContactPage() {
  return (
    <SiteShell current="contact">
      <main>
        <section className="site-section py-14 md:py-18">
          <div className="site-container">
            <Badge variant="outline" className="border-black/8 bg-white text-[#4b5563]">
              Collaboration & Integration
            </Badge>
            <h1 className="mt-6 max-w-5xl text-balance text-5xl font-semibold leading-none tracking-[-0.06em] text-[#111827] md:text-7xl">
              这页先不讲空泛合作，而是把你真正会推进的接入方向说清楚。
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-9 text-[#4b5563]">
              现在你最需要的不是一个很“会说话”的 AI 官网，而是一套能承接产品、
              控制台和后续外部系统打通的正式站点结构。
            </p>
          </div>
        </section>

        <SiteSection
          eyebrow="Tracks"
          title="当前最现实的三类推进方向"
          description="这些也是官网、后台和 HelloAPI 对接最自然的落点。"
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {tracks.map((item) => {
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
          eyebrow="Delivery Scope"
          title="按这条路线推进时，正式版本应该覆盖什么"
          description="不是做一页好看的 landing page，而是把整套站点和后台做成未来可继续扩展的基础。"
        >
          <Card className="border-black/8 bg-white shadow-[0_18px_40px_rgba(17,24,39,0.06)]">
            <CardContent className="grid gap-3 p-6 md:grid-cols-2">
              {scope.map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-black/8 bg-[#f7f7f5] px-5 py-5 text-sm leading-7 text-[#374151]"
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </SiteSection>

        <SiteSection
          eyebrow="Advice"
          title="如果按最快、最稳的方式推进，我建议就是下面这两条"
          description="不要继续让视觉和内容偏离你真正要交付的产品方向。"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {advice.map((item) => {
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
                    Current Entry
                  </div>
                  <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
                    这一阶段先把 HelloClaw 做成真正能对外展示、对内管理的正式产品站。
                  </h2>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href="/login">
                      进入后台
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
