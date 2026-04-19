import { DashboardPageHeader } from "@/app/dashboard/_components/dashboard-page-header";
import { requireAdminPageSession } from "@/lib/require-admin-page-session";
import { AuditLogsClient } from "./audit-logs-client";

export default async function AdminAuditPage() {
  await requireAdminPageSession(["SUPER_ADMIN"]);

  return (
    <div className="mx-auto flex w-full max-w-[1450px] flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Admin / Audit"
        title="审计与日志"
        description="追踪系统配置变更、管理员操作与关键业务轨迹。"
      />

      <AuditLogsClient />
    </div>
  );
}
