"use client";

import { ArrowRight, Check, X } from "lucide-react";
import { motion } from "framer-motion";

const beforeItems = [
  "反复沟通",
  "任务断层",
  "仅仅是个演示工具",
] as const;

const afterItems = [
  "清晰协作",
  "持续推进",
  "可交付的自动化工作流",
] as const;

export function Comparison() {
  return (
    <section className="relative px-4 py-24 md:px-8">
      <div className="pointer-events-none absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_50%_18%,rgba(230,0,0,0.08),transparent_24%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-4xl font-black tracking-[-0.05em] text-white md:text-5xl">
            带来了什么变化？
          </h2>
        </div>

        <div className="mt-12 grid items-center gap-6 xl:grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-transparent bg-[linear-gradient(180deg,rgba(14,14,16,0.96),rgba(8,8,10,0.98))] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.34)]"
          >
            <div className="text-xs uppercase tracking-[0.28em] text-gray-500">Before</div>
            <div className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-gray-200">
              传统工作流
            </div>
            <div className="mt-8 grid gap-4">
              {beforeItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-4 text-base text-gray-500"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-900/40 bg-red-950/40 text-red-400">
                    <X size={18} />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center"
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-claw-red/18 bg-claw-red/10 shadow-[0_0_24px_rgba(230,0,0,0.16)]">
              <div className="absolute inset-0 rounded-full bg-claw-red/12 blur-xl" />
              <ArrowRight className="relative text-claw-red-glow" size={28} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel glow-border-red rounded-3xl border border-claw-red/20 bg-[radial-gradient(circle_at_top_right,rgba(230,0,0,0.14),transparent_42%),linear-gradient(180deg,rgba(20,20,22,0.78),rgba(12,12,14,0.96))] p-7 shadow-[0_0_54px_rgba(230,0,0,0.12)]"
          >
            <div className="text-xs uppercase tracking-[0.28em] text-claw-red-glow/80">
              After
            </div>
            <div className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
              HelloClaw 协作流
            </div>
            <div className="mt-8 grid gap-4">
              {afterItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4 text-base text-white"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-claw-red/30 bg-claw-red/10 text-claw-red-glow shadow-[0_0_16px_rgba(255,36,0,0.14)]">
                    <Check size={18} />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
