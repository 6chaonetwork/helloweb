import { DashboardPageHeader } from "@/app/dashboard/_components/dashboard-page-header";
import { requireAdminPageSession } from "@/lib/require-admin-page-session";
import { ChannelSettingsForm } from "./channel-settings-form";
import { QrLoginDebugPanel } from "./qr-login-debug-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminChannelSettingsPage() {
  await requireAdminPageSession(["SUPER_ADMIN"]);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Admin / Channel Settings"
        title="公众号与扫码登录配置"
        description="这里是 HelloClaw 渠道与身份链路的核心入口。先稳定公众号参数、回调地址、二维码登录基地址和运行策略，后续用户入库、设备绑定与联调才会稳定。"
      />

      <Tabs defaultValue="production" className="gap-6">
        <TabsList className="h-auto w-full justify-start gap-8 rounded-none border-b border-zinc-200 bg-transparent p-0">
          <TabsTrigger
            value="production"
            className="rounded-none border-b-2 border-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-claw-red data-[state=active]:bg-transparent data-[state=active]:text-zinc-900 data-[state=active]:shadow-none"
          >
            生产配置 (Production Config)
          </TabsTrigger>
          <TabsTrigger
            value="debugger"
            className="rounded-none border-b-2 border-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-claw-red data-[state=active]:bg-transparent data-[state=active]:text-zinc-900 data-[state=active]:shadow-none"
          >
            扫码联调 (QR Debugger)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="outline-none">
          <ChannelSettingsForm />
        </TabsContent>

        <TabsContent value="debugger" className="outline-none">
          <QrLoginDebugPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
