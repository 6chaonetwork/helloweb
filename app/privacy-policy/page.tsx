import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "隐私政策",
  description: "HelloClaw 隐私政策与数据处理说明。",
};

const sections = [
  {
    title: "信息收集",
    body: "在提供登录、控制台管理、站点交互与客户支持过程中，HelloClaw 可能收集必要的身份识别信息、设备信息、操作日志与业务配置数据，用于维持服务运行与安全审计。",
  },
  {
    title: "信息使用",
    body: "收集的信息将用于账户识别、服务交付、风险防控、产品改进与客户支持。除法律法规另有要求或获得你的明确授权外，不会超出合理范围处理相关信息。",
  },
  {
    title: "信息保护",
    body: "HelloClaw 会采取访问控制、权限隔离、日志留存与必要的安全措施保护信息安全。对于接入第三方模型、外部 API 或企业内部系统的场景，建议由使用方同步建立自己的安全策略与合规边界。",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-dark-base px-4 py-16 text-gray-200 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/35">
          HelloClaw Legal
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
          隐私政策
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-gray-400">
          本页为官网阶段的基础隐私说明页占位版本，用于承接底部合规入口。正式上线前，建议根据真实登录、支付、统计与后台系统情况补充细则。
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
