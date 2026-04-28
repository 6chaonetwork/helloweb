import { DashboardPageHeader } from "@/app/dashboard/_components/dashboard-page-header";
import { requireAdminPageSession } from "@/lib/require-admin-page-session";
import { UsbLicensesAdminClient } from "./usb-licenses-admin-client";

export default async function UsbLicensesAdminPage() {
  await requireAdminPageSession(["SUPER_ADMIN"]);

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Admin / USB"
        title="U 盘授权"
        description="集中处理 U 盘授权申请、审批签发、本地离线授权文件和后续远程停用。"
      />
      <UsbLicensesAdminClient />
    </div>
  );
}
