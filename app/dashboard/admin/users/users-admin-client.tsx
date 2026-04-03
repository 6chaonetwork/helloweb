"use client";

import { useEffect, useState, type ReactNode } from "react";

type UserListItem = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  firstLoginAt: string | null;
  lastLoginAt: string | null;
  role: string;
  status: string;
  wechatOpenId: string | null;
  wechatUnionId: string | null;
  wechatFollowed: boolean;
  wechatFollowedAt: string | null;
  wechatNickname: string | null;
  wechatAvatarUrl: string | null;
  wechatSex: number | null;
  wechatLanguage: string | null;
  wechatCity: string | null;
  wechatProvince: string | null;
  wechatCountry: string | null;
  wechatProfileSyncStatus: string | null;
  wechatProfileSyncError: string | null;
  wechatProfileSyncedAt: string | null;
  lastWechatEvent: string | null;
  lastWechatEventAt: string | null;
  createdAt: string;
  updatedAt: string;
  devices: Array<{
    id: string;
    clientDeviceId: string | null;
    deviceName: string;
    deviceType: string | null;
    platform: string | null;
    clientVersion: string | null;
    status: string;
    lastSeenAt: string | null;
    updatedAt: string;
  }>;
  authSessions: Array<{
    id: string;
    deviceId: string | null;
    accessTokenExpiresAt: string;
    refreshTokenExpiresAt: string;
    lastSeenAt: string | null;
    revokedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  qrChallenges: Array<{
    id: string;
    status: string;
    qrSource: string | null;
    qrToken: string;
    clientDeviceId: string | null;
    wechatOpenId: string | null;
    approvedAt: string | null;
    consumedAt: string | null;
    createdAt: string;
  }>;
  _count: {
    devices: number;
    authSessions: number;
    qrChallenges: number;
  };
};

type UserDetail = UserListItem & {
  devices: Array<{
    id: string;
    clientDeviceId: string | null;
    deviceName: string;
    deviceType: string | null;
    platform: string | null;
    clientVersion: string | null;
    status: string;
    lastSeenAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  authSessions: Array<{
    id: string;
    deviceId: string | null;
    accessTokenExpiresAt: string;
    refreshTokenExpiresAt: string;
    lastSeenAt: string | null;
    revokedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  qrChallenges: Array<{
    id: string;
    status: string;
    qrSource: string | null;
    qrToken: string;
    clientDeviceId: string | null;
    wechatOpenId: string | null;
    approvedAt: string | null;
    consumedAt: string | null;
    createdAt: string;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    targetType: string | null;
    targetId: string | null;
    createdAt: string;
  }>;
};

type UserListResponse = {
  stats: {
    totalUsers: number;
    followedUsers: number;
    activeSessions: number;
    activeDevices: number;
  };
  items: UserListItem[];
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function UsersAdminClient() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserListResponse | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function loadUsers(search = "") {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users?q=${encodeURIComponent(search)}`, { cache: "no-store" });
      const payload = (await response.json()) as UserListResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "加载用户列表失败");
      }
      setData(payload);
      const nextSelectedId = selectedUserId && payload.items.some((item) => item.id === selectedUserId)
        ? selectedUserId
        : (payload.items[0]?.id ?? null);
      setSelectedUserId(nextSelectedId);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载用户列表失败");
      setData(null);
      setSelectedUserId(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    const loadDetail = async () => {
      setDetailLoading(true);
      try {
        const response = await fetch(`/api/admin/users/${selectedUserId}`, { cache: "no-store" });
        const payload = (await response.json()) as { user?: UserDetail; error?: string };
        if (!response.ok || !payload.user) {
          throw new Error(payload.error || "加载用户详情失败");
        }
        if (!cancelled) {
          setDetail(payload.user);
        }
      } catch (loadError) {
        if (!cancelled) {
          setDetail(null);
          setError(loadError instanceof Error ? loadError.message : "加载用户详情失败");
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false);
        }
      }
    };

    void loadDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedUserId]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard label="用户总数" value={String(data?.stats.totalUsers ?? 0)} />
        <StatCard label="已关注公众号" value={String(data?.stats.followedUsers ?? 0)} />
        <StatCard label="活跃会话" value={String(data?.stats.activeSessions ?? 0)} />
        <StatCard label="活跃设备" value={String(data?.stats.activeDevices ?? 0)} />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/4 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-white/68">支持按邮箱、昵称、OpenID、设备名搜索</div>
          <div className="flex gap-2">
            <input
              className="h-11 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white outline-none"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索用户..."
            />
            <button
              type="button"
              onClick={() => void loadUsers(query)}
              className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 font-semibold text-[#08101f]"
            >
              搜索
            </button>
          </div>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-white/10 bg-white/4 p-4">
          <h2 className="mb-4 text-xl font-semibold text-white">用户列表</h2>
          {loading ? (
            <div className="text-white/60">加载中...</div>
          ) : !data?.items.length ? (
            <div className="text-white/60">还没有扫码入库的用户</div>
          ) : (
            <div className="space-y-3">
              {data.items.map((item) => {
                const isSelected = item.id === selectedUserId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedUserId(item.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-fuchsia-400/35 bg-fuchsia-500/10"
                        : "border-white/10 bg-[#0c1224] hover:bg-white/6"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-[15px] font-semibold text-white">
                          {item.wechatNickname || item.name || item.email}
                        </div>
                        <div className="mt-1 truncate text-xs text-white/46">{item.email}</div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/50">
                          <span className="rounded-full border border-white/10 px-2 py-1">
                            {item.wechatFollowed ? "已关注" : "未确认关注"}
                          </span>
                          <span className="rounded-full border border-white/10 px-2 py-1">
                            资料同步 {item.wechatProfileSyncStatus || "未记录"}
                          </span>
                          <span className="rounded-full border border-white/10 px-2 py-1">
                            设备 {item._count.devices}
                          </span>
                          <span className="rounded-full border border-white/10 px-2 py-1">
                            会话 {item._count.authSessions}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-[11px] text-white/34">
                        {formatDate(item.lastLoginAt || item.updatedAt)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/4 p-4">
          <h2 className="mb-4 text-xl font-semibold text-white">用户详情</h2>
          {!selectedUserId ? (
            <div className="text-white/60">请选择左侧用户查看详情</div>
          ) : detailLoading ? (
            <div className="text-white/60">正在加载详情...</div>
          ) : !detail ? (
            <div className="text-white/60">用户详情暂时不可用</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#0c1224] p-4">
                <div className="text-lg font-semibold text-white">
                  {detail.wechatNickname || detail.name || detail.email}
                </div>
                <div className="mt-2 grid gap-2 text-sm text-white/62 md:grid-cols-2">
                  <div>邮箱：{detail.email}</div>
                  <div>状态：{detail.status}</div>
                  <div>OpenID：{detail.wechatOpenId || "-"}</div>
                  <div>UnionID：{detail.wechatUnionId || "-"}</div>
                  <div>资料同步状态：{detail.wechatProfileSyncStatus || "-"}</div>
                  <div>最近同步时间：{formatDate(detail.wechatProfileSyncedAt)}</div>
                  <div>地区：{[detail.wechatCountry, detail.wechatProvince, detail.wechatCity].filter(Boolean).join(" / ") || "-"}</div>
                  <div>最近登录：{formatDate(detail.lastLoginAt)}</div>
                  <div>首次登录：{formatDate(detail.firstLoginAt)}</div>
                  <div>最近微信事件：{detail.lastWechatEvent || "-"}</div>
                </div>
                {detail.wechatProfileSyncError ? (
                  <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    资料同步失败原因：{detail.wechatProfileSyncError}
                  </div>
                ) : null}
              </div>

              <DetailSection title="设备">
                {detail.devices.length === 0 ? (
                  <p className="text-white/50">暂无设备</p>
                ) : (
                  detail.devices.map((device) => (
                    <DetailCard
                      key={device.id}
                      title={device.deviceName}
                      subtitle={`${device.platform || "-"} · ${device.clientVersion || "-"}`}
                      lines={[
                        `clientDeviceId: ${device.clientDeviceId || "-"}`,
                        `status: ${device.status}`,
                        `lastSeenAt: ${formatDate(device.lastSeenAt)}`,
                      ]}
                    />
                  ))
                )}
              </DetailSection>

              <DetailSection title="登录会话">
                {detail.authSessions.length === 0 ? (
                  <p className="text-white/50">暂无登录会话</p>
                ) : (
                  detail.authSessions.map((sessionItem) => (
                    <DetailCard
                      key={sessionItem.id}
                      title={sessionItem.id}
                      subtitle={sessionItem.revokedAt ? "已撤销" : "有效中"}
                      lines={[
                        `deviceId: ${sessionItem.deviceId || "-"}`,
                        `lastSeenAt: ${formatDate(sessionItem.lastSeenAt)}`,
                        `accessExpiresAt: ${formatDate(sessionItem.accessTokenExpiresAt)}`,
                        `refreshExpiresAt: ${formatDate(sessionItem.refreshTokenExpiresAt)}`,
                      ]}
                    />
                  ))
                )}
              </DetailSection>

              <DetailSection title="扫码挑战">
                {detail.qrChallenges.length === 0 ? (
                  <p className="text-white/50">暂无扫码挑战</p>
                ) : (
                  detail.qrChallenges.map((challenge) => (
                    <DetailCard
                      key={challenge.id}
                      title={challenge.status}
                      subtitle={challenge.qrSource || "-"}
                      lines={[
                        `qrToken: ${challenge.qrToken}`,
                        `wechatOpenId: ${challenge.wechatOpenId || "-"}`,
                        `clientDeviceId: ${challenge.clientDeviceId || "-"}`,
                        `approvedAt: ${formatDate(challenge.approvedAt)}`,
                        `consumedAt: ${formatDate(challenge.consumedAt)}`,
                      ]}
                    />
                  ))
                )}
              </DetailSection>

              <DetailSection title="审计日志">
                {detail.auditLogs.length === 0 ? (
                  <p className="text-white/50">暂无审计日志</p>
                ) : (
                  detail.auditLogs.map((log) => (
                    <DetailCard
                      key={log.id}
                      title={log.action}
                      subtitle={formatDate(log.createdAt)}
                      lines={[
                        `targetType: ${log.targetType || "-"}`,
                        `targetId: ${log.targetId || "-"}`,
                      ]}
                    />
                  ))
                )}
              </DetailSection>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
      <div className="text-xs uppercase tracking-[0.22em] text-white/42">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0c1224] p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/58">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function DetailCard({
  title,
  subtitle,
  lines,
}: {
  title: string;
  subtitle?: string;
  lines: string[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-white">{title}</div>
        {subtitle ? <div className="text-[11px] text-white/40">{subtitle}</div> : null}
      </div>
      <div className="mt-2 space-y-1 text-[12px] leading-5 text-white/58">
        {lines.map((line) => (
          <div key={line} className="break-all">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
