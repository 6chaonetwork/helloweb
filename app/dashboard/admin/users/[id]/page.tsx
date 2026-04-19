import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  Circle,
  LogOut,
  ShieldAlert,
  Smartphone,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatDate(value?: Date | string | null) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function statusTone(status: string) {
  return status === "ACTIVE"
    ? {
        dot: "bg-emerald-500",
        text: "text-emerald-600",
        bg: "bg-emerald-50 border-emerald-200",
      }
    : {
        dot: "bg-red-500",
        text: "text-red-600",
        bg: "bg-red-50 border-red-200",
      };
}

function AvatarBlock({
  avatarUrl,
  fallback,
}: {
  avatarUrl?: string | null;
  fallback: string;
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fallback}
        className="h-18 w-18 rounded-2xl border border-zinc-200 object-cover"
      />
    );
  }

  return (
    <div className="grid h-18 w-18 place-items-center rounded-2xl border border-zinc-200 bg-red-50 text-2xl font-semibold text-claw-red">
      {fallback.slice(0, 1).toUpperCase()}
    </div>
  );
}

function SectionCard({
  title,
  description,
  icon: Icon,
  actions,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-500">
            <Icon size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
            <p className="mt-1 text-sm leading-7 text-zinc-500">{description}</p>
          </div>
        </div>
        {actions}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      devices: {
        orderBy: { updatedAt: "desc" },
      },
      authSessions: {
        orderBy: { updatedAt: "desc" },
      },
      qrChallenges: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 30,
      },
    },
  });

  if (!user) {
    notFound();
  }

  const displayName = user.wechatNickname || user.name || user.email;
  const tone = statusTone(user.status);

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button
            asChild
            variant="outline"
            className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
          >
            <Link href="/dashboard/admin/users">
              <ArrowLeft size={15} />
              返回列表
            </Link>
          </Button>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <Ban size={15} />
              禁用账号
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={15} />
              清除会话
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <AvatarBlock avatarUrl={user.avatarUrl || user.wechatAvatarUrl} fallback={displayName} />
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                User 360 Detail
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-zinc-900">
                {displayName}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className={`border ${tone.bg} ${tone.text}`}>
                  <span className={`mr-2 inline-flex h-2 w-2 rounded-full ${tone.dot}`} />
                  {user.status}
                </Badge>
                <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">
                  {user.wechatFollowed ? "已关注公众号" : "未确认关注"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-zinc-500 md:grid-cols-2 lg:min-w-[420px]">
            <MetaItem label="邮箱 / 标识" value={user.email} />
            <MetaItem label="注册时间" value={formatDate(user.createdAt)} />
            <MetaItem label="OpenID" value={user.wechatOpenId || "-"} />
            <MetaItem label="UnionID" value={user.wechatUnionId || "-"} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <SectionCard
          title="设备与会话"
          description="查看该用户当前绑定终端与活跃登录会话。"
          icon={Smartphone}
          actions={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={14} />
              强制下线（预留）
            </button>
          }
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-sm font-medium text-zinc-900">绑定设备</div>
              <div className="mt-4 space-y-3">
                {user.devices.length === 0 ? (
                  <div className="text-sm text-zinc-500">暂无设备</div>
                ) : (
                  user.devices.map((device) => (
                    <div key={device.id} className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-zinc-900">{device.deviceName}</div>
                          <div className="mt-1 text-xs text-zinc-500">
                            {device.platform || "-"} / {device.clientVersion || "-"}
                          </div>
                        </div>
                        <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">
                          {device.status}
                        </Badge>
                      </div>
                      <div className="mt-3 text-xs text-zinc-400">
                        最后在线：{formatDate(device.lastSeenAt)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-sm font-medium text-zinc-900">活跃会话</div>
              <div className="mt-4 space-y-3">
                {user.authSessions.length === 0 ? (
                  <div className="text-sm text-zinc-500">暂无会话</div>
                ) : (
                  user.authSessions.map((session) => (
                    <div key={session.id} className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-zinc-900">{session.id}</div>
                          <div className="mt-1 text-xs text-zinc-500">
                            deviceId: {session.deviceId || "-"}
                          </div>
                        </div>
                        <Badge className={`border ${session.revokedAt ? "border-red-200 bg-red-50 text-red-600" : "border-emerald-200 bg-emerald-50 text-emerald-600"}`}>
                          {session.revokedAt ? "已撤销" : "有效中"}
                        </Badge>
                      </div>
                      <div className="mt-3 grid gap-1 text-xs text-zinc-400">
                        <div>最后活动：{formatDate(session.lastSeenAt)}</div>
                        <div>Access 到期：{formatDate(session.accessTokenExpiresAt)}</div>
                        <div>Refresh 到期：{formatDate(session.refreshTokenExpiresAt)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-6">
          <SectionCard
            title="扫码与验证轨迹"
            description="最近扫码登录请求、审批状态与消费记录。"
            icon={ShieldAlert}
          >
            <div className="space-y-3">
              {user.qrChallenges.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
                  暂无扫码与验证轨迹
                </div>
              ) : (
                user.qrChallenges.map((challenge) => (
                  <div key={challenge.id} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-zinc-900">{challenge.status}</div>
                        <div className="mt-1 break-all text-xs text-zinc-500">
                          qrToken: {challenge.qrToken}
                        </div>
                      </div>
                      <Badge className="border-zinc-200 bg-white text-zinc-500">
                        {challenge.qrSource || "-"}
                      </Badge>
                    </div>
                    <div className="mt-3 grid gap-1 text-xs text-zinc-400">
                      <div>创建时间：{formatDate(challenge.createdAt)}</div>
                      <div>审批时间：{formatDate(challenge.approvedAt)}</div>
                      <div>消费时间：{formatDate(challenge.consumedAt)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="资产与额度"
            description="订阅、额度、余额和商业化数据的预留位。"
            icon={Wallet}
          >
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-sm leading-7 text-zinc-500">
              当前仍是预留模块。后续可在此接入用户订阅版本、余额、API Token 额度与消费统计。
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="操作与审计日志"
        description="与当前用户相关的后台关键行为轨迹。"
        icon={ShieldAlert}
      >
        <div className="space-y-3">
          {user.auditLogs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
              暂无审计日志
            </div>
          ) : (
            user.auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-claw-red" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-zinc-900">{log.action}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {log.targetType || "System"} {log.targetId ? `· ${log.targetId}` : ""}
                  </div>
                </div>
                <div className="shrink-0 text-xs text-zinc-400">
                  {formatDate(log.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-2 break-all text-sm font-medium text-zinc-900">{value}</div>
    </div>
  );
}
