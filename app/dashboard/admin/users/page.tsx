import { DashboardPageHeader } from "@/app/dashboard/_components/dashboard-page-header";
import { UsersAdminClient } from "./users-admin-client";

export default function AdminUsersPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Admin / Users"
        title="用户管理"
        description="统一查看扫码登录后的用户、设备、会话与挑战记录，把身份链路真正沉淀成可管理、可运营的数据面。"
      />

      <div>
        <UsersAdminClient />
      </div>
    </div>
  );
}
