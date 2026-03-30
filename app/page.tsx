import Link from "next/link";
import {
  ArrowRight,
  Bot,
  ChevronRight,
  Clock3,
  Command,
  Cpu,
  FileText,
  Globe,
  Layers3,
  MessageSquareText,
  Shield,
  Sparkles,
  Workflow,
  CheckCircle2,
} from "lucide-react";

const highlights = [
  "多通道 AI 助手中枢",
  "自动化、消息、设备、文档一体化",
  "给个人与团队的高级代理操作系统",
];

const pillars = [
  {
    icon: MessageSquareText,
    title: "像一个真正的助手在工作",
    desc: "HelloClaw 把聊天、记忆、上下文与持续协作整合在一起，不只是回答问题，而是帮你推进事情。",
  },
  {
    icon: Workflow,
    title: "把工作流真正跑起来",
    desc: "从定时任务、消息分发到浏览器与文档操作，把原本碎片化的动作串成完整流程。",
  },
  {
    icon: Shield,
    title: "可控、可审计、可扩展",
    desc: "面向真实生产环境设计，支持权限边界、配置管理、后台服务、设备接入与工程化落地。",
  },
];

const featureCards = [
  {
    icon: Globe,
    title: "统一消息触点",
    desc: "把多种聊天渠道统一接入，让 AI 能在真正发生工作的地方持续存在。",
  },
  {
    icon: Clock3,
    title: "长期运行与定时调度",
    desc: "不仅能响应提问，也能在正确时间主动提醒、巡检、触发任务。",
  },
  {
    icon: FileText,
    title: "文档与知识协作",
    desc: "直接连接文档、知识库和表格，把 AI 输出纳入团队工作流而不是停留在对话框。",
  },
  {
    icon: Cpu,
    title: "设备与自动化执行",
    desc: "浏览器、节点、系统能力与后台配置结合，形成可落地的 agent runtime。",
  },
];

const capabilities = [
  "统一接入 Web / Telegram / Discord / Feishu 等聊天触点",
  "支持浏览器自动化、文档处理、定时任务与跨会话协作",
  "具备长期记忆与项目上下文，适合持续型产品与研发场景",
  "既能做个人 AI 军师，也能做团队内部的智能操作层",
];

const scenarios = [
  {
    title: "个人 AI 军师",
    desc: "做你的产品参谋、研发搭子、日程提醒者和执行中枢。",
  },
  {
    title: "团队内部智能操作层",
    desc: "把跨系统动作、通知、知识沉淀和流程触发整合成统一体验。",
  },
  {
    title: "面向真实业务的 Agent 产品",
    desc: "不是玩具 demo，而是能继续扩展为完整业务系统的产品基础设施。",
  },
];

const faqs = [
  {
    q: "HelloClaw 和普通聊天机器人有什么区别？",
    a: "普通聊天机器人更像单次问答界面，HelloClaw 更像一层 agent operating layer：它能接入渠道、运行任务、调用系统能力，并持续参与工作。",
  },
  {
    q: "它适合个人还是团队？",
    a: "两者都适合。个人场景下它是高级 AI 助手，团队场景下它可以升级成内部智能操作层与自动化中枢。",
  },
  {
    q: "官网下一步还能怎么升级？",
    a: "可以继续扩成完整产品官网，包括产品截图、部署方式、案例、定价、文档入口、下载与转化路径。",
  },
];

const stats = [
  { value: "24/7", label: "持续在线的代理能力" },
  { value: "Multi-channel", label: "多消息入口统一汇聚" },
  { value: "Human-in-the-loop", label: "关键动作保留人工监督" },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top,rgba(124,156,255,0.22),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(157,124,255,0.18),transparent_22%),linear-gradient(180deg,#050816_0%,#070b17_52%,#04070f_100%)] text-white">
      <section className="relative px-5 pb-8 pt-7 md:px-10 xl:px-12">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.9),rgba(0,0,0,0.2),transparent)]" />

        <header className="relative z-10 mx-auto mb-10 flex max-w-[1240px] flex-col gap-6 md:mb-12 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-linear-to-br from-[#7c9cff] to-[#9d7cff] font-extrabold text-white shadow-[0_12px_40px_rgba(124,156,255,0.34)]">
              H
            </div>
            <div>
              <div className="text-base font-bold">HelloClaw</div>
              <div className="text-xs text-white/50">AI agent operating layer</div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-white/72">
            <a href="#capabilities" className="transition hover:text-white">
              能力
            </a>
            <a href="#product" className="transition hover:text-white">
              产品
            </a>
            <a href="#architecture" className="transition hover:text-white">
              架构
            </a>
            <a href="#scenarios" className="transition hover:text-white">
              场景
            </a>
            <a href="#faq" className="transition hover:text-white">
              FAQ
            </a>
          </nav>
        </header>

        <section className="relative z-10 mx-auto grid max-w-[1240px] gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,38,0.82),rgba(7,11,24,0.72))] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-3xl md:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-2 text-[0.8rem] tracking-[0.04em] text-[#dbe4ff]">
              <Sparkles size={14} />
              <span>HelloClaw Official Website</span>
            </div>

            <h1 className="mt-5 text-5xl leading-none font-semibold tracking-[-0.05em] text-white md:text-7xl xl:text-[5.8rem]">
              不是一个聊天框，<br />
              而是你的 <span className="bg-linear-to-br from-white via-[#9fd3ff] to-[#b899ff] bg-clip-text text-transparent">AI 行动中枢</span>
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-white/72 md:text-[1.06rem]">
              HelloClaw 把 AI 助手、自动化工作流、设备连接、文档系统与消息渠道整合成一个真正可运行的产品层。
              它不止会回答，更会协助推进、执行与持续协同。
            </p>

            <div className="mt-7 flex flex-wrap gap-3.5">
              <a
                href="https://helloclaw.top"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-linear-to-br from-white to-[#cfe0ff] px-5 font-bold text-[#08101f] transition hover:-translate-y-0.5"
              >
                官方站点
                <ArrowRight size={16} />
              </a>
              <Link
                href="https://github.com/6chaonetwork/helloweb"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/16 bg-white/3 px-5 font-bold text-white transition hover:-translate-y-0.5"
              >
                GitHub 仓库
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-2.5">
              {highlights.map((item) => (
                <div key={item} className="rounded-full border border-white/8 bg-white/5 px-3.5 py-2.5 text-sm text-[#dbe4ff]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,38,0.82),rgba(7,11,24,0.72))] p-[22px] shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-3xl">
            <div className="rounded-3xl border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(89,225,255,0.16),transparent_35%),linear-gradient(180deg,rgba(124,156,255,0.14),rgba(255,255,255,0.04))] p-6">
              <div className="mb-2.5 inline-block text-[0.78rem] uppercase tracking-[0.12em] text-[#a9bbff]">核心定位</div>
              <div className="mb-2.5 text-2xl font-bold">让 AI 真正接入你的工作系统</div>
              <p className="m-0 leading-8 text-white/72">
                从对话入口，到任务执行，到后台配置与管理界面，形成一条完整闭环，而不是零散 demo。
              </p>
            </div>

            <div className="grid gap-3.5">
              <div className="flex items-start gap-3.5 rounded-3xl border border-white/8 bg-white/4 p-[18px]">
                <Bot size={18} />
                <div>
                  <strong className="mb-1.5 block">Agent-first</strong>
                  <p className="m-0 leading-8 text-white/72">面向长期协作设计，不只是一次性问答。</p>
                </div>
              </div>
              <div className="flex items-start gap-3.5 rounded-3xl border border-white/8 bg-white/4 p-[18px]">
                <Command size={18} />
                <div>
                  <strong className="mb-1.5 block">Automation-native</strong>
                  <p className="m-0 leading-8 text-white/72">消息、浏览器、定时任务、文档与节点能力原生整合。</p>
                </div>
              </div>
              <div className="flex items-start gap-3.5 rounded-3xl border border-white/8 bg-white/4 p-[18px]">
                <Layers3 size={18} />
                <div>
                  <strong className="mb-1.5 block">Product-ready</strong>
                  <p className="m-0 leading-8 text-white/72">更像一套真实产品官网，而不是默认脚手架页面。</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 pb-[72px] pt-1 md:px-10 xl:px-12">
        <div className="grid gap-[18px] md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[28px] border border-white/10 bg-[rgba(11,18,36,0.72)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-3xl">
              <div className="text-[clamp(1.6rem,4vw,2.4rem)] font-extrabold">{stat.value}</div>
              <div className="mt-2.5 text-white/72">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="capabilities" className="mx-auto max-w-[1240px] px-5 pb-[72px] md:px-10 xl:px-12">
        <div className="mb-6 max-w-3xl">
          <span className="mb-2.5 inline-block text-[0.78rem] uppercase tracking-[0.12em] text-[#a9bbff]">Capabilities</span>
          <h2 className="mb-2 text-4xl leading-tight font-semibold md:text-5xl">一眼看上去就该是 HelloClaw 的官网</h2>
          <p className="m-0 leading-8 text-white/72">
            这一版不只是替换默认首页，而是先把品牌氛围、产品定位、能力表达和产品气质一起立起来。
          </p>
        </div>

        <div className="grid gap-[18px] md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article key={pillar.title} className="rounded-[28px] border border-white/10 bg-[rgba(11,18,36,0.72)] p-[26px] shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-3xl">
                <div className="mb-[18px] grid h-11 w-11 place-items-center rounded-2xl border border-white/8 bg-linear-to-br from-[rgba(124,156,255,0.24)] to-[rgba(157,124,255,0.2)]">
                  <Icon size={20} />
                </div>
                <h3 className="mb-2 block text-xl font-semibold">{pillar.title}</h3>
                <p className="m-0 leading-8 text-white/72">{pillar.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="product" className="mx-auto max-w-[1240px] px-5 pb-[72px] md:px-10 xl:px-12">
        <div className="mb-6 max-w-3xl">
          <span className="mb-2.5 inline-block text-[0.78rem] uppercase tracking-[0.12em] text-[#a9bbff]">Product Surface</span>
          <h2 className="mb-2 text-4xl leading-tight font-semibold md:text-5xl">把官网从“有个首页”推进到“有产品感的首页”</h2>
          <p className="m-0 leading-8 text-white/72">
            这里开始补足真正 landing page 应该有的中段内容，让用户不仅觉得好看，还知道它到底能做什么。
          </p>
        </div>

        <div className="grid gap-[18px] md:grid-cols-2">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="flex flex-col rounded-[28px] border border-white/10 bg-[rgba(11,18,36,0.72)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-3xl">
                <div className="mb-[18px] grid h-11 w-11 place-items-center rounded-2xl border border-white/8 bg-linear-to-br from-[rgba(124,156,255,0.24)] to-[rgba(157,124,255,0.2)]">
                  <Icon size={20} />
                </div>
                <h3 className="mb-2 block text-xl font-semibold">{feature.title}</h3>
                <p className="m-0 leading-8 text-white/72">{feature.desc}</p>
                <div className="mt-[18px] inline-flex items-center gap-2 font-semibold text-[#d9e4ff]">
                  继续扩展成详细模块页
                  <ChevronRight size={16} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="architecture" className="mx-auto grid max-w-[1240px] gap-[22px] px-5 pb-[72px] md:px-10 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:px-12">
        <div className="max-w-3xl">
          <span className="mb-2.5 inline-block text-[0.78rem] uppercase tracking-[0.12em] text-[#a9bbff]">Architecture</span>
          <h2 className="mb-2 text-4xl leading-tight font-semibold md:text-5xl">面向产品化，而不是停留在玩具演示</h2>
          <p className="m-0 leading-8 text-white/72">
            官网首页需要同时传达能力边界、工程可信度和产品审美。这里先把这三件事立住。
          </p>
        </div>

        <div className="grid gap-[18px] rounded-[28px] border border-white/10 bg-[rgba(11,18,36,0.72)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-3xl md:grid-cols-[minmax(0,1fr)_minmax(280px,0.78fr)]">
          <div className="grid gap-3">
            {capabilities.map((item) => (
              <div key={item} className="flex min-h-14 items-center gap-3 rounded-[18px] border border-white/6 bg-white/4 px-4">
                <span className="h-2.5 w-2.5 rounded-full bg-linear-to-br from-[#7c9cff] to-[#59e1ff] shadow-[0_0_16px_rgba(89,225,255,0.6)]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-[22px] border border-white/8 bg-[rgba(16,24,48,0.92)] p-[22px]">
            <div className="mb-2.5 inline-block text-[0.78rem] uppercase tracking-[0.12em] text-[#a9bbff]">Current direction</div>
            <h3 className="mb-2 block text-2xl font-semibold">更强品牌感，更清晰价值表达，更适合继续向官网完整化扩展</h3>
            <p className="m-0 leading-8 text-white/72">
              下一步可以继续补完整的导航体系、场景页、部署说明、案例模块、转化组件和文档入口。
            </p>
          </div>
        </div>
      </section>

      <section id="scenarios" className="mx-auto max-w-[1240px] px-5 pb-[72px] md:px-10 xl:px-12">
        <div className="mb-6 max-w-3xl">
          <span className="mb-2.5 inline-block text-[0.78rem] uppercase tracking-[0.12em] text-[#a9bbff]">Use Cases</span>
          <h2 className="mb-2 text-4xl leading-tight font-semibold md:text-5xl">它既适合个人，也适合团队和真正的业务场景</h2>
          <p className="m-0 leading-8 text-white/72">
            官网如果只讲能力，不讲落地场景，用户会难以建立价值感。所以这里补足“它到底适合谁”。
          </p>
        </div>

        <div className="grid gap-[18px] md:grid-cols-3">
          {scenarios.map((scenario) => (
            <article key={scenario.title} className="flex items-start gap-3.5 rounded-[28px] border border-white/10 bg-[rgba(11,18,36,0.72)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-3xl">
              <CheckCircle2 size={18} />
              <div>
                <h3 className="mb-2 block text-xl font-semibold">{scenario.title}</h3>
                <p className="m-0 leading-8 text-white/72">{scenario.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-[1240px] px-5 pb-[72px] md:px-10 xl:px-12">
        <div className="mb-6 max-w-3xl">
          <span className="mb-2.5 inline-block text-[0.78rem] uppercase tracking-[0.12em] text-[#a9bbff]">FAQ</span>
          <h2 className="mb-2 text-4xl leading-tight font-semibold md:text-5xl">把用户最常见的问题提前回答掉</h2>
          <p className="m-0 leading-8 text-white/72">
            这是 landing page 很重要的一层：减少理解成本，也让页面从“展示”变成“转化”。
          </p>
        </div>

        <div className="grid gap-3">
          {faqs.map((faq) => (
            <article key={faq.q} className="rounded-[28px] border border-white/10 bg-[rgba(11,18,36,0.72)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-3xl">
              <h3 className="mb-3 text-xl font-semibold">{faq.q}</h3>
              <p className="m-0 leading-8 text-white/72">{faq.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 pb-8 md:px-10 xl:px-12">
        <div className="flex flex-col gap-5 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(124,156,255,0.18),transparent_24%),linear-gradient(180deg,rgba(14,22,44,0.9),rgba(8,12,24,0.88))] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-3xl xl:flex-row xl:items-center xl:justify-between">
          <div>
            <span className="mb-2.5 inline-block text-[0.78rem] uppercase tracking-[0.12em] text-[#a9bbff]">Ready to ship the next layer</span>
            <h2 className="mb-2 text-3xl leading-tight font-semibold md:text-4xl">
              这版已经脱离默认模板感了。下一步可以继续做成更完整的正式官网视觉体系。
            </h2>
            <p className="m-0 leading-8 text-white/72">
              比如产品截图区、动效层、案例模块、部署说明、文档入口、下载与注册转化链路。
            </p>
          </div>
          <div className="flex flex-wrap gap-3.5 xl:justify-end">
            <a
              href="http://203.195.157.103:3000/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-linear-to-br from-white to-[#cfe0ff] px-5 font-bold text-[#08101f] transition hover:-translate-y-0.5"
            >
              打开线上预览
              <ArrowRight size={16} />
            </a>
            <Link
              href="https://github.com/6chaonetwork/helloweb"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/16 bg-white/3 px-5 font-bold text-white transition hover:-translate-y-0.5"
            >
              查看代码仓库
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto mb-[72px] flex max-w-[1240px] flex-col gap-6 rounded-[28px] border border-white/10 bg-[rgba(11,18,36,0.72)] px-5 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:px-10 xl:flex-row xl:items-center xl:justify-between xl:px-12">
        <div className="flex items-start gap-3.5">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-linear-to-br from-[#7c9cff] to-[#9d7cff] font-extrabold text-white shadow-[0_12px_40px_rgba(124,156,255,0.34)]">
            H
          </div>
          <div>
            <div className="text-base font-bold">HelloClaw</div>
            <div className="text-xs text-white/50">Build agents that actually do things.</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-[18px] text-white/72">
          <a href="#capabilities" className="transition hover:text-white">
            能力
          </a>
          <a href="#product" className="transition hover:text-white">
            产品
          </a>
          <a href="#scenarios" className="transition hover:text-white">
            场景
          </a>
          <a href="#faq" className="transition hover:text-white">
            FAQ
          </a>
        </div>
      </footer>
    </main>
  );
}
