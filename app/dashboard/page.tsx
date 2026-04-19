import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CircleAlert,
  LayoutDashboard,
  ShieldCheck,
  Smartphone,
  UserPlus,
  Users,
  Wifi,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function startOfDaysAgo(days: number) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
}

function formatDateTime(value: Date | string | null) {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatShortDate(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function normalizeAuditType(action: string) {
  const normalized = action.toLowerCase();

  if (
    normalized.includes("config") ||
    normalized.includes("channel_config") ||
    normalized.includes("onboarding_config")
  ) {
    return "CONFIG";
  }

  if (normalized.includes("admin_account")) {
    return "ADMIN";
  }

  if (normalized.includes("announcement")) {
    return "ANNOUNCE";
  }

  if (
    normalized.includes("auth") ||
    normalized.includes("login") ||
    normalized.includes("qr_") ||
    normalized.includes("wechat_callback")
  ) {
    return "AUTH";
  }

  return "SYSTEM";
}

function buildDailySeries(
  dates: Date[],
  getDate: (entry: Date) => Date,
) {
  const today = new Date();
  const buckets = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - (6 - index),
    );
    return {
      key: date.toISOString().slice(0, 10),
      label: formatShortDate(date),
      value: 0,
    };
  });

  const bucketMap = new Map(buckets.map((item) => [item.key, item]));

  for (const entry of dates) {
    const key = getDate(entry).toISOString().slice(0, 10);
    const bucket = bucketMap.get(key);
    if (bucket) {
      bucket.value += 1;
    }
  }

  return buckets;
}

function TrendBars({
  data,
  accent = "bg-claw-red/80",
}: {
  data: Array<{ label: string; value: number }>;
  accent?: string;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="mt-4 flex items-end gap-2">
      {data.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-16 w-full items-end rounded-md bg-zinc-100 px-1 pb-1">
            <div
              className={`w-full rounded-sm ${accent}`}
              style={{ height: `${Math.max((item.value / max) * 100, item.value > 0 ? 12 : 0)}%` }}
            />
          </div>
          <div className="text-[10px] text-zinc-400">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const todayStart = startOfToday();
  const sevenDaysStart = startOfDaysAgo(6);

  const [
    newUsersToday,
    activeDevices,
    activeSessions,
    usersLast7Days,
    challengesLast7Days,
    recentAdmins,
    recentAudits,
    recentAnnouncements,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        createdAt: {
          gte: todayStart,
        },
      },
    }),
    prisma.device.count({
      where: {
        status: "ACTIVE",
      },
    }),
    prisma.authSession.count({
      where: {
        revokedAt: null,
      },
    }),
    prisma.user.findMany({
      where: {
        createdAt: {
          gte: sevenDaysStart,
        },
      },
      select: {
        createdAt: true,
      },
    }),
    prisma.qrLoginChallenge.findMany({
      where: {
        createdAt: {
          gte: sevenDaysStart,
        },
      },
      select: {
        createdAt: true,
      },
    }),
    prisma.admin.findMany({
      orderBy: [{ lastLoginAt: "desc" }, { updatedAt: "desc" }],
      take: 6,
      select: {
        id: true,
        username: true,
        role: true,
        status: true,
        lastLoginAt: true,
        updatedAt: true,
      },
    }),
    prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 18,
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        createdAt: true,
        metadataJson: true,
      },
    }),
    prisma.announcement.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      take: 6,
      select: {
        id: true,
        title: true,
        status: true,
        pinned: true,
        updatedAt: true,
      },
    }),
  ]);

  const userSeries = buildDailySeries(
    usersLast7Days.map((item) => item.createdAt),
    (entry) => entry,
  );
  const challengeSeries = buildDailySeries(
    challengesLast7Days.map((item) => item.createdAt),
    (entry) => entry,
  );

  const configChangesToday = recentAudits.filter(
    (item) =>
      item.createdAt >= todayStart &&
      normalizeAuditType(item.action) === "CONFIG",
  ).length;

  const adminActivity = recentAdmins.map((item) => ({
    id: item.id,
    username: item.username,
    role: item.role === "SUPER_ADMIN" ? "Super Admin" : "Operator",
    status: item.status,
    lastSeen: formatDateTime(item.lastLoginAt || item.updatedAt),
  }));

  const configActivity = recentAudits
    .filter((item) => normalizeAuditType(item.action) === "CONFIG")
    .slice(0, 6);

  const kpis = [
    {
      title: "今日新增用户",
      value: String(newUsersToday),
      hint: "New Users",
      icon: UserPlus,
      iconClassName: "border-zinc-200 bg-zinc-50 text-zinc-500",
      trend: userSeries,
    },
    {
      title: "活跃设备数",
      value: String(activeDevices),
      hint: "Active Devices",
      icon: Smartphone,
      iconClassName: "border-zinc-200 bg-zinc-50 text-zinc-500",
      trend: challengeSeries,
    },
    {
      title: "活跃会话数",
      value: String(activeSessions),
      hint: "Active Sessions",
      icon: Wifi,
      iconClassName: "border-zinc-200 bg-zinc-50 text-zinc-500",
      trend: challengeSeries,
    },
    {
      title: "今日配置变更",
      value: String(configChangesToday),
      hint: "Config Changes",
      icon: CircleAlert,
      iconClassName: "border-claw-red/18 bg-red-50 text-claw-red",
      trend: recentAudits
        .slice(0, 7)
        .reverse()
        .map((item, index) => ({
          label: String(index + 1),
          value: normalizeAuditType(item.action) === "CONFIG" ? 1 : 0,
        })),
    },
  ] as const;

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            Dashboard
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-zinc-900 md:text-4xl">
            总览
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            className="bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92"
          >
            <Link href="/dashboard/admin/channel-settings">
              渠道与接入
              <ArrowRight size={15} />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
          >
            <Link href="/dashboard/admin/system">
              系统与权限
              <ArrowRight size={15} />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.title}
              className="rounded-xl border-zinc-200 bg-white shadow-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-sm font-medium text-zinc-500">{item.title}</div>
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-2xl border ${item.iconClassName}`}
                  >
                    <Icon size={18} />
                  </div>
                </div>
                <div className="mt-6 flex items-end justify-between gap-3">
                  <div className="text-4xl font-semibold tracking-[-0.04em] text-zinc-900">
                    {item.value}
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs text-zinc-400">
                    <Activity size={14} />
                    {item.hint}
                  </div>
                </div>
                <TrendBars data={item.trend} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Card className="rounded-xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-zinc-900">最近管理员活动</div>
                <div className="mt-1 text-sm text-zinc-500">
                  Recent Admin Activity
                </div>
              </div>
              <LayoutDashboard size={17} className="text-zinc-400" />
            </div>

            <div className="mt-6 space-y-3">
              {adminActivity.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
                  暂无管理员活动
                </div>
              ) : (
                adminActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-zinc-900">{item.username}</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {item.role} · {item.lastSeen}
                      </div>
                    </div>
                    <Badge
                      className={
                        item.status === "ACTIVE"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                          : "border-red-200 bg-red-50 text-red-600"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-zinc-900">最近配置变更</div>
                <div className="mt-1 text-sm text-zinc-500">
                  Recent Config Changes
                </div>
              </div>
              <ShieldCheck size={17} className="text-zinc-400" />
            </div>

            <div className="mt-6 space-y-3">
              {configActivity.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
                  暂无配置变更
                </div>
              ) : (
                configActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4"
                  >
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-claw-red" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-zinc-900">{item.action}</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {item.targetType || "System"} {item.targetId ? `· ${item.targetId}` : ""}
                      </div>
                    </div>
                    <div className="shrink-0 text-xs text-zinc-400">
                      {formatDateTime(item.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="rounded-xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-zinc-900">最近公告状态</div>
                <div className="mt-1 text-sm text-zinc-500">
                  Recent Announcements
                </div>
              </div>
              <Users size={17} className="text-zinc-400" />
            </div>

            <div className="mt-6 space-y-3">
              {recentAnnouncements.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
                  暂无公告
                </div>
              ) : (
                recentAnnouncements.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-zinc-900">{item.title}</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        更新时间：{formatDateTime(item.updatedAt)}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {item.pinned ? (
                        <Badge className="border-red-200 bg-red-50 text-claw-red">置顶</Badge>
                      ) : null}
                      <Badge className="border-zinc-200 bg-white text-zinc-600">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-zinc-900">最近系统审计</div>
                <div className="mt-1 text-sm text-zinc-500">
                  Recent Audit Trail
                </div>
              </div>
              <CircleAlert size={17} className="text-zinc-400" />
            </div>

            <div className="mt-6 space-y-3">
              {recentAudits.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4"
                >
                  <div
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      normalizeAuditType(item.action) === "CONFIG"
                        ? "bg-claw-red"
                        : normalizeAuditType(item.action) === "ADMIN"
                          ? "bg-orange-500"
                          : "bg-zinc-400"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-zinc-900">{item.action}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {item.targetType || "System"} {item.targetId ? `· ${item.targetId}` : ""}
                    </div>
                  </div>
                  <div className="shrink-0 text-xs text-zinc-400">
                    {formatDateTime(item.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
