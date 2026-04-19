import { DashboardPageHeader } from "@/app/dashboard/_components/dashboard-page-header";
import { prisma } from "@/lib/db";
import { requireAdminPageSession } from "@/lib/require-admin-page-session";
import { SystemTabsClient } from "./system-tabs-client";

export default async function AdminSystemPage() {
  await requireAdminPageSession(["SUPER_ADMIN"]);
  let databaseHealthy = true;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    databaseHealthy = false;
  }

  return (
    <div className="mx-auto flex w-full max-w-[1450px] flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Admin / System"
        title="系统与权限"
        description="统一管理后台多账号权限与控制台全局物理状态。"
      />

      <SystemTabsClient
        environmentLabel={process.env.NODE_ENV === "production" ? "Production" : "Debug"}
        timezoneLabel={Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Shanghai"}
        databaseHealthy={databaseHealthy}
      />
    </div>
  );
}
