import { requireAdminPageSession } from "@/lib/require-admin-page-session";
import { OnboardingConfigClient } from "./onboarding-config-client";

export default async function AdminOnboardingPage() {
  const session = await requireAdminPageSession();

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="m-0 text-xs uppercase tracking-[0.3em] text-white/45">Admin</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-3 text-4xl font-semibold">公告窗配置</h1>
            <p className="max-w-3xl text-white/68">
              这里管理公告窗顶部的 badge、标题、描述、标签、步骤和联系文案。保存后客户端重新打开公告窗即可拉到远程配置。
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72">
            当前账号：admin {session.username}
          </div>
        </div>

        <div className="mt-8">
          <OnboardingConfigClient />
        </div>
      </div>
    </main>
  );
}
