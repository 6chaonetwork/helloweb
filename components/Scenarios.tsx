"use client";

import {
  BriefcaseBusiness,
  Clapperboard,
  Code2,
  MessageSquareMore,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ScenarioItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
};

const scenarios: ScenarioItem[] = [
  {
    title: "短剧创作与影视制作",
    description:
      "编剧、分镜师、提示词工程师一应俱全。从大纲推演到镜头脚本拆解，让内容生产提速十倍。",
    icon: Clapperboard,
    className: "md:col-span-2",
  },
  {
    title: "跨境电商与出海营销",
    description:
      "打破语言壁垒与时差。多语种 Listing 批量优化、竞品分析、本土化社媒营销一气呵成。",
    icon: ShoppingBag,
  },
  {
    title: "自媒体与内容矩阵",
    description:
      "选题挖掘、多平台风格改写、排版配图建议。单兵作战也能拥有顶配 MCN 团队的产出效率。",
    icon: MessageSquareMore,
  },
  {
    title: "独立开发者与技术外包",
    description:
      "需求拆解、代码审查、测试用例编写。精准填补技术团队的人效缺口。",
    icon: Code2,
  },
  {
    title: "私域运营与客户管理",
    description:
      "对话总结、意向打标、跟进话术生成。将繁杂的社群维护转化为高度自动化的流水线。",
    icon: BriefcaseBusiness,
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

export function Scenarios() {
  return (
    <section id="scenarios" className="relative overflow-hidden px-4 py-24 md:px-8">
      <div className="pointer-events-none absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_50%_0%,rgba(230,0,0,0.12),transparent_24%),radial-gradient(circle_at_80%_24%,rgba(255,36,0,0.08),transparent_18%)]" />

      <div className="relative mx-auto max-w-5xl text-center">
        <h2 className="text-balance text-4xl font-black tracking-[-0.05em] text-white md:text-5xl">
          让 AI 共享员工，无缝接入你的业务流
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-gray-400">
          面向不同体量与行业的标准化交付方案，一个人也能指挥千军万马。
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative mx-auto mt-14 grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2"
      >
        {scenarios.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.article
              key={item.title}
              variants={cardVariants}
              className={cn(
                "glass-panel rounded-[32px] border border-white/5 bg-white/[0.02] p-8 md:p-10",
                "transition-all duration-300 hover:-translate-y-2 hover:border-claw-red/30 hover:bg-white/[0.04]",
                index === 0 && "md:col-span-2",
                item.className,
              )}
            >
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-claw-red/20 bg-[linear-gradient(135deg,rgba(230,0,0,0.20),rgba(255,36,0,0.08))] text-claw-red-glow shadow-[0_0_22px_rgba(255,36,0,0.16)]">
                <Icon size={24} />
              </div>

              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white md:text-3xl">
                {item.title}
              </h3>
              <p className="mt-5 max-w-[56ch] text-base leading-8 text-gray-400">
                {item.description}
              </p>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
}
