import { requireAdminPageSession } from "@/lib/require-admin-page-session";
import { UsersAdminClient } from "./users-admin-client";

export default async function AdminUsersPage() {
  const session = await requireAdminPageSession();

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="m-0 text-xs uppercase tracking-[0.3em] text-white/45">Admin</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-3 text-4xl font-semibold">用户管理</h1>
            <p className="max-w-3xl text-white/68">
              这里可以直接查看扫码登录后的用户、设备、登录会话与最近扫码挑战，确认公众号回调和桌面端消费是否真的写进数据库。
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72">
            当前账号：admin {session.username}
          </div>
        </div>

        <div className="mt-8">
          <UsersAdminClient />
        </div>
      </div>
    </main>
  );
}
