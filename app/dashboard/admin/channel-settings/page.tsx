import { requireAdminPageSession } from "@/lib/require-admin-page-session";

export default async function AdminChannelSettingsPage() {
  const session = await requireAdminPageSession();

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="m-0 text-xs uppercase tracking-[0.3em] text-white/45">Admin</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-3 text-4xl font-semibold">Channel Settings</h1>
            <p className="max-w-3xl text-white/68">
              新项目里的第一版管理页骨架。先把公众号/官方通道配置、二维码登录行为策略和 API 连起来，再继续做真实表单与权限。
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72">
            当前账号：admin {session.username}
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          <section className="rounded-3xl border border-white/10 bg-white/4 p-6">
            <p className="m-0 text-xs text-white/50">Overview</p>
            <h2 className="mb-2 mt-3 text-2xl font-semibold">Channel basics</h2>
            <p className="m-0 text-white/66">Channel type, environment, enabled state, readiness summary.</p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/4 p-6">
            <p className="m-0 text-xs text-white/50">Credentials</p>
            <h2 className="mb-2 mt-3 text-2xl font-semibold">Official account access</h2>
            <p className="m-0 text-white/66">App ID, app secret, webhook URL, verify token, signing secret.</p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/4 p-6">
            <p className="m-0 text-xs text-white/50">QR Login Runtime</p>
            <h2 className="mb-2 mt-3 text-2xl font-semibold">Behavior & policy</h2>
            <p className="m-0 text-white/66">Challenge TTL, polling interval, allowed platforms, device binding mode.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
