import Link from "next/link";
import { requireAdminPageSession } from "@/lib/require-admin-page-session";

const cards = [
  {
    eyebrow: "Website",
    title: "Landing & Marketing",
    desc: "当前官网首页与品牌表达层，负责承接外部访问与产品叙事。",
  },
  {
    eyebrow: "QR Login",
    title: "Companion Flow",
    desc: "扫码登录、设备绑定、用户入库和桌面端消费都会从这里逐步接回。",
  },
  {
    eyebrow: "Admin",
    title: "Channel Settings",
    desc: "管理公众号、官方通道、二维码登录参数、回调与运行策略。",
    href: "/dashboard/admin/channel-settings",
  },
  {
    eyebrow: "Users",
    title: "User Management",
    desc: "查看扫码登录后的用户、设备、会话与资料同步情况。",
    href: "/dashboard/admin/users",
  },
  {
    eyebrow: "Notice",
    title: "Announcement Management",
    desc: "管理公告窗左侧显示的公告、维护通知与动态内容。",
    href: "/dashboard/admin/announcements",
  },
];

export default async function DashboardPage() {
  const session = await requireAdminPageSession();

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="m-0 text-xs uppercase tracking-[0.3em] text-white/45">Dashboard</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-3 text-4xl font-semibold">HelloClaw Control Center</h1>
            <p className="max-w-3xl text-white/68">
              这里是后台控制中心。当前重点是把平台内用户身份、公告管理、公众号扫码登录与桌面端接入全部接成正式产品形态。
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72">
            已登录：admin {session.username}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
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
