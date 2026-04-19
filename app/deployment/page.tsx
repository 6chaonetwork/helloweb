import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Cable,
  Command,
  LayoutDashboard,
  Network,
  ServerCog,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { SiteSection } from "@/components/site/site-section";
import { SiteShell } from "@/components/site/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "部署路径",
  description: "查看 HelloClaw 从官网与控制台到 HelloAPI 接入的推荐部署路径。",
};

const deploymentModes: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
}> = [
  {
    icon: Command,
    title: "先交付桌面端",
    description: "先让团队真的开始使用 HelloClaw，建立桌面工作区的实际使用场景。",
    bullets: ["本地安装", "模型接入", "聊天 / 技能 / 自动化"],
  },
  {
    icon: LayoutDashboard,
    title: "再稳定官网与后台",
    description: "官网负责产品叙事，后台负责配置和运营，先把这两个入口做稳。",
    bullets: ["官方站点", "登录页", "控制台与运营模块"],
  },
  {
    icon: ServerCog,
    title: "最后接入外部系统",
    description: "HelloAPI 保持独立运行，HelloClaw 通过服务端代理读取 admin API。",
    bullets: ["管理接口代理", "账户与订单同步", "Key / 余额 / 销售数据"],
  },
];

const topology = [
  "HelloClaw 官网负责产品说明、部署路径和转化入口。",
  "HelloClaw 控制台负责渠道、用户、公告和未来商业化后台。",
  "HelloAPI 独立运行，负责账户、充值、订单、Key 与销售数据能力。",
];

const roadmap = [
  {
    icon: Network,
    title: "阶段 1",
    description: "先完成正式官网与后台，让产品有稳定入口。",
  },
  {
    icon: Cable,
    title: "阶段 2",
    description: "通过服务端代理方式接入 HelloAPI admin API。",
  },
  {
    icon: WalletCards,
    title: "阶段 3",
    description: "在 HelloClaw 控制台中承接余额、Key、订单和销售看板。",
  },
];

export default function DeploymentPage() {
  return (
    <SiteShell current="deployment">
      <main>
        <section className="site-section py-14 md:py-18">
          <div className="site-container">
            <Badge variant="outline" className="border-black/8 bg-white text-[#4b5563]">
              Deployment Path
            </Badge>
            <h1 className="mt-6 max-w-5xl text-balance text-5xl font-semibold leading-none tracking-[-0.06em] text-[#111827] md:text-7xl">
              推荐路线不是把所有系统硬拼在一起，而是分阶段让每一层先稳定。
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-9 text-[#4b5563]">
              对你现在来说，最稳的方式就是先把官网和控制台做成正式版本，再让独立运行的
              HelloAPI 通过管理接口接入，不要一开始就把前端、后台和账务系统搅成一团。
            </p>
          </div>
        </section>

        <SiteSection
          eyebrow="Three Stages"
          title="当前最适合的三步走"
          description="这样可以保证每一步都可上线、可验证、可继续推进。"
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {deploymentModes.map((item) => {
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
                    <div className="mt-5 grid gap-2">
                      {item.bullets.map((bullet) => (
                        <div
                          key={bullet}
                          className="rounded-2xl border border-black/8 bg-[#f7f7f5] px-4 py-3 text-sm text-[#374151]"
                        >
                          {bullet}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </SiteSection>

        <SiteSection
          eyebrow="System Relationship"
          title="系统关系应该保持清楚"
          description="官网、控制台和 HelloAPI 各自负责的事情应该明确分层。"
        >
          <Card className="border-black/8 bg-white shadow-[0_18px_40px_rgba(17,24,39,0.06)]">
            <CardContent className="grid gap-3 p-6">
              {topology.map((item, index) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-black/8 bg-[#f7f7f5] px-5 py-5"
                >
                  <div className="text-xs uppercase tracking-[0.28em] text-[#9ca3af]">
                    Layer {index + 1}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#374151]">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </SiteSection>

        <SiteSection
          eyebrow="Roadmap"
          title="真正靠谱的实施顺序"
          description="先让产品入口正确，再让系统连接正确。"
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {roadmap.map((item) => {
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
                    Practical Advice
                  </div>
                  <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
                    先把正式站点和控制台上线，再进 HelloAPI 对接阶段，会快很多。
                  </h2>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href="/contact">
                      查看合作与接入
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
