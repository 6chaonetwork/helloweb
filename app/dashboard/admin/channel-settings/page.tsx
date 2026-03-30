import { requireAdminPageSession } from "@/lib/require-admin-page-session";
import { ChannelSettingsForm } from "./channel-settings-form";

export default async function AdminChannelSettingsPage() {
  const session = await requireAdminPageSession();

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="m-0 text-xs uppercase tracking-[0.3em] text-white/45">Admin</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-3 text-4xl font-semibold">公众号与扫码登录配置</h1>
            <p className="max-w-3xl text-white/68">
              现在这页已经不是说明页，而是第一版可编辑配置页。你可以先把公众号参数、回调地址和扫码登录策略填起来。
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72">
            当前账号：admin {session.username}
          </div>
        </div>

        <div className="mt-8">
          <ChannelSettingsForm />
        </div>
      </div>
    </main>
  );
}
