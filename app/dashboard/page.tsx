import Link from "next/link";

const cards = [
  {
    eyebrow: "Website",
    title: "Landing & Marketing",
    desc: "当前官网首页与品牌表达层，负责承接外部访问与产品叙事。",
  },
  {
    eyebrow: "QR Login",
    title: "Companion Flow",
    desc: "扫码登录挑战、审批状态轮询、设备绑定策略都会从这里逐步接回。",
  },
  {
    eyebrow: "Admin",
    title: "Channel Settings",
    desc: "管理公众号/官方通道、二维码登录参数、回调与运行策略。",
    href: "/dashboard/admin/channel-settings",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#050816] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="m-0 text-xs uppercase tracking-[0.3em] text-white/45">Dashboard</p>
        <h1 className="mb-3 mt-4 text-4xl font-semibold">HelloClaw Control Center</h1>
        <p className="max-w-3xl text-white/68">
          这是新的管理骨架。当前重点是先把 channel settings 与 QR login challenge 的后端/API 重新跑起来。
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {cards.map((card) => {
            const inner = (
              <>
                <p className="m-0 text-xs text-white/50">{card.eyebrow}</p>
                <h2 className="mb-2 mt-3 text-2xl font-semibold">{card.title}</h2>
                <p className="m-0 text-white/65">{card.desc}</p>
              </>
            );

            if (card.href) {
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="rounded-3xl border border-fuchsia-400/25 bg-fuchsia-500/12 p-6 text-white no-underline"
                >
                  {inner}
                </Link>
              );
            }

            return (
              <section key={card.title} className="rounded-3xl border border-white/10 bg-white/4 p-6">
                {inner}
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
