import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardForbiddenPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[980px] items-center justify-center">
      <div className="w-full rounded-[28px] border border-zinc-200 bg-white p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] md:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-red-200 bg-red-50 text-claw-red">
          <ShieldAlert size={28} />
        </div>

        <div className="mt-6 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
          Access Restricted
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-zinc-900 md:text-4xl">
          你当前没有权限访问这个模块
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-zinc-500 md:text-base">
          当前页面仅对具备更高权限的管理员开放。你可以返回控制台总览，或联系超级管理员为你的账号调整角色权限。
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 md:flex-row">
          <Button
            asChild
            className="bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92"
          >
            <Link href="/dashboard">返回控制台总览</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
          >
            <Link href="/dashboard/admin/content">前往内容运营</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
