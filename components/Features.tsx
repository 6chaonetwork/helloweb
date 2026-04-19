"use client";

import { useState, type CSSProperties, type MouseEvent } from "react";
import {
  Archive,
  Blocks,
  BriefcaseBusiness,
  Database,
  Network,
  Sparkles,
  Target,
  Timer,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";

type FeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
};

const featureItems: FeatureItem[] = [
  {
    title: "一键安装，简单易操作",
    description:
      "极简部署流程，告别繁琐的环境配置，几分钟内即可启动你的私人 AI 工作台。",
    icon: Zap,
    className: "md:col-span-2",
  },
  {
    title: "多智能体协作",
    description: "支持多个 AI 角色按分工协同处理复杂任务。",
    icon: Network,
  },
  {
    title: "长期任务承接",
    description: "保留项目级上下文，告别每次对话的重复解释。",
    icon: Timer,
  },
  {
    title: "独有的记忆实验室",
    description:
      "所有记忆存储都可见、可管理、可追踪，不再是黑盒式记忆系统。",
    icon: Database,
    className: "md:col-span-2",
  },
  {
    title: "强大的归档机制",
    description:
      "解决上下文过长问题，重要记录随时可回看，让长期协作不再断层。",
    icon: Archive,
    className: "md:col-span-2",
  },
  {
    title: "拉个大神做助理",
    description:
      "汇集 17 种世界级人物的大脑供你使用，把高质量思考方式直接引入工作台。",
    icon: Sparkles,
    className: "md:col-span-2",
  },
  {
    title: "多种职业选择",
    description:
      "内置专业自主研发的海量职业库，让不同岗位都能快速找到对应 AI 角色。",
    icon: BriefcaseBusiness,
  },
  {
    title: "多模型与账号管理",
    description:
      "统一管理模型提供商、账号与调用配置，减少团队工作区里的配置分散。",
    icon: Blocks,
  },
  {
    title: "从单一工具到 AI 团队",
    description:
      "HelloClaw 不是传统的单线程聊天窗口，而是为你配置不同工种的数字员工，打造流水线般的自动化交付体验。",
    className: "md:col-span-2",
    icon: Network,
  },
  {
    title: "交付导向",
    description: "直指业务终局，输出可直接用于实际工作流的成果。",
    icon: Target,
    className: "md:col-span-2",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

function FeatureCard({ item }: { item: FeatureItem }) {
  const Icon = item.icon;
  const [mouse, setMouse] = useState({ x: 0, y: 0, active: false });

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMouse({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      active: true,
    });
  };

  const handleMouseLeave = () => {
    setMouse((prev) => ({ ...prev, active: false }));
  };

  const spotlightStyle: CSSProperties = mouse.active
    ? {
        background: `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, rgba(230,0,0,0.15), transparent 40%)`,
      }
    : {
        background: "transparent",
      };

  return (
    <motion.article
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={[
        "group glass-panel relative z-10 overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-6",
        "transition-all duration-300 ease-out hover:-translate-y-1 hover:border-claw-red/40 hover:bg-white/[0.04]",
        item.className ?? "",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 z-0" style={spotlightStyle} />
      <div className="relative z-10">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-claw-red/18 bg-[linear-gradient(135deg,rgba(230,0,0,0.18),rgba(255,36,0,0.06))] text-claw-red shadow-[0_0_24px_rgba(255,36,0,0.14)] transition-all duration-300 group-hover:shadow-[0_0_34px_rgba(255,36,0,0.22)]">
          <Icon size={22} />
        </div>

        <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">
          {item.title}
        </h3>
        <p className="mt-4 max-w-[44ch] text-sm leading-8 text-gray-400">
          {item.description}
        </p>
      </div>
    </motion.article>
  );
}

export function Features() {
  return (
    <section id="intro" className="relative px-4 py-24 md:px-8 md:py-32">
      <div className="pointer-events-none absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_50%_0%,rgba(230,0,0,0.10),transparent_26%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-4xl font-black tracking-[-0.05em] text-white md:text-5xl">
            为什么选择 HelloClaw
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-400">
            为真实业务流设计的 AI 协作基建
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 lg:gap-6"
        >
          {featureItems.map((item) => (
            <FeatureCard key={item.title} item={item} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
