import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "用户协议",
  description: "HelloClaw 用户协议与使用说明。",
};

const sections = [
  {
    title: "服务说明",
    body: "HelloClaw 提供 AI Agent 桌面工作区、任务协作与控制台相关功能。你在使用过程中，应确保提交的信息、工作流配置与实际业务行为符合法律法规及平台规则。",
  },
  {
    title: "账户与责任",
    body: "你应妥善保管登录信息、设备环境与调用凭证。因账户管理不当、违法使用或超授权接入造成的风险与损失，由对应使用方自行承担。",
  },
  {
    title: "合规使用",
    body: "不得利用 HelloClaw 从事违法违规、侵犯他人权益、恶意传播、绕过授权或其他破坏系统稳定性的行为。平台有权在必要时采取限制、暂停或终止服务措施。",
  },
];

export default function UserAgreementPage() {
  return (
    <main className="min-h-screen bg-dark-base px-4 py-16 text-gray-200 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/35">
          HelloClaw Legal
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
          用户协议
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-gray-400">
          本页为 HelloClaw 官网展示阶段的基础协议页占位版本，用于承接底部合规链接。正式商用前，建议由法务结合实际服务模式继续完善。
        </p>

        <div className="mt-10 space-y-5">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[24px] border border-white/8 bg-white/[0.03] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
            >
              <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-gray-400">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/"
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}
