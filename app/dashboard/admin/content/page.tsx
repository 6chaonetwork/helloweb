import { DashboardPageHeader } from "@/app/dashboard/_components/dashboard-page-header";
import { AnnouncementsAdminClient } from "../announcements/announcements-admin-client";
import { OnboardingConfigClient } from "../onboarding/onboarding-config-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminContentPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1450px] flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Admin / Content"
        title="内容运营"
        description="统一承接公告管理与欢迎引导配置，让官网公告、首屏弹层与 onboarding 文案都归属于同一套内容控制面。"
      />

      <Tabs defaultValue="announcements" className="gap-6">
        <TabsList className="h-auto w-full justify-start gap-8 rounded-none border-b border-zinc-200 bg-transparent p-0">
          <TabsTrigger
            value="announcements"
            className="rounded-none border-b-2 border-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-claw-red data-[state=active]:bg-transparent data-[state=active]:text-zinc-900 data-[state=active]:shadow-none"
          >
            公告管理 (Announcements)
          </TabsTrigger>
          <TabsTrigger
            value="onboarding"
            className="rounded-none border-b-2 border-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-claw-red data-[state=active]:bg-transparent data-[state=active]:text-zinc-900 data-[state=active]:shadow-none"
          >
            欢迎引导 (Onboarding)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="outline-none">
          <AnnouncementsAdminClient />
        </TabsContent>

        <TabsContent value="onboarding" className="outline-none">
          <OnboardingConfigClient />
        </TabsContent>
      </Tabs>
    </div>
  );
}
