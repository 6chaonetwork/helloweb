"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Ban, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type UserListItem = {
  id: string;
  email: string;
  name: string | null;
  displayName: string | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  status: string;
  wechatOpenId: string | null;
  wechatUnionId: string | null;
  wechatFollowed: boolean;
  wechatNickname: string | null;
  wechatProfileSyncStatus: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    devices: number;
    authSessions: number;
    qrChallenges: number;
  };
};

type UserListResponse = {
  stats: {
    totalUsers: number;
    followedUsers: number;
    activeSessions: number;
    activeDevices: number;
  };
  items: UserListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"lastLoginAt" | "createdAt">("lastLoginAt");
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserListResponse | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<UserListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);

  const loadUsers = useCallback(async (
    search = query,
    nextPage = page,
    nextLimit = pageSize,
    nextSort = sortBy,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users?q=${encodeURIComponent(search)}&page=${nextPage}&limit=${nextLimit}&sort=${nextSort}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as UserListResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "加载用户列表失败");
      }
      setData(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载用户列表失败");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, query, sortBy]);

  useEffect(() => {
    void loadUsers("", 1, 20, "lastLoginAt");
  }, [loadUsers]);

  async function handleSuspendUser() {
    if (!suspendTarget) return;
    setMutating(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${suspendTarget.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: suspendTarget.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED",
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "更新用户状态失败");
      }
      setSuspendTarget(null);
      await loadUsers(query, page, pageSize);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "更新用户状态失败");
    } finally {
      setMutating(false);
    }
  }

  async function handleDeleteUser() {
    if (!deleteTarget) return;
    setMutating(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "删除用户失败");
      }
      setDeleteTarget(null);
      await loadUsers(query, page, pageSize);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "删除用户失败");
    } finally {
      setMutating(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="用户总数" value={String(data?.stats.totalUsers ?? 0)} />
        <StatCard label="已关注公众号" value={String(data?.stats.followedUsers ?? 0)} />
        <StatCard label="活跃会话" value={String(data?.stats.activeSessions ?? 0)} />
        <StatCard label="活跃设备" value={String(data?.stats.activeDevices ?? 0)} />
      </div>

      <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-zinc-500">
            支持按邮箱、昵称、OpenID 和设备名搜索。
          </div>
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索用户..."
              className="border-zinc-200 bg-white text-zinc-900"
            />
            <Button
              type="button"
              onClick={() => {
                setPage(1);
                void loadUsers(query, 1, pageSize, sortBy);
              }}
              className="bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92"
            >
              <Search size={15} />
              搜索
            </Button>
            <div className="w-full md:w-[180px]">
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  const nextSort = value as "lastLoginAt" | "createdAt";
                  setSortBy(nextSort);
                  setPage(1);
                  void loadUsers(query, 1, pageSize, nextSort);
                }}
              >
                <SelectTrigger className="border-zinc-200 bg-white text-zinc-900">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent className="border-zinc-200 bg-white text-zinc-900 shadow-sm">
                  <SelectItem value="lastLoginAt">按最后登录时间</SelectItem>
                  <SelectItem value="createdAt">按注册时间</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[160px]">
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  const nextLimit = Number(value);
                  setPageSize(nextLimit);
                  setPage(1);
                  void loadUsers(query, 1, nextLimit, sortBy);
                }}
              >
                <SelectTrigger className="border-zinc-200 bg-white text-zinc-900">
                  <SelectValue placeholder="每页条数" />
                </SelectTrigger>
                <SelectContent className="border-zinc-200 bg-white text-zinc-900 shadow-sm">
                  <SelectItem value="20">20 条 / 页</SelectItem>
                  <SelectItem value="50">50 条 / 页</SelectItem>
                  <SelectItem value="100">100 条 / 页</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <CardHeader>
          <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">User List</Badge>
          <CardTitle className="text-zinc-900">用户列表</CardTitle>
          <CardDescription className="text-zinc-500">
            列表页用于筛选、检索和快速判断用户状态，点击“查看详情”进入独立详情页。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
              正在加载用户列表...
            </div>
          ) : !data?.items.length ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
              还没有扫码入库的用户。
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
              <Table>
                <TableHeader className="[&_tr]:border-zinc-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-zinc-500">用户</TableHead>
                    <TableHead className="text-zinc-500">身份与状态</TableHead>
                    <TableHead className="text-zinc-500">设备 / 会话 / 挑战</TableHead>
                    <TableHead className="text-zinc-500">登录 IP</TableHead>
                    <TableHead className="text-zinc-500">最后登录</TableHead>
                    <TableHead className="text-right text-zinc-500">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-zinc-200 hover:bg-zinc-50"
                    >
                      <TableCell className="min-w-[260px] text-zinc-900">
                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-zinc-900">
                            {item.displayName || item.wechatNickname || item.name || item.email}
                          </div>
                          <div className="text-xs text-zinc-500">{item.email}</div>
                          {(item.wechatNickname || item.name) ? (
                            <div className="text-xs text-zinc-400">
                              微信名称：{item.wechatNickname || item.name}
                            </div>
                          ) : null}
                          <div className="text-xs text-zinc-400">
                            注册时间：{formatDate(item.createdAt)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[220px]">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">
                              {item.status}
                            </Badge>
                            <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">
                              {item.wechatFollowed ? "已关注" : "未确认关注"}
                            </Badge>
                          </div>
                          <div className="text-xs text-zinc-500">
                            OpenID：{item.wechatOpenId || "-"}
                          </div>
                          <div className="text-xs text-zinc-500">
                            同步状态：{item.wechatProfileSyncStatus || "未记录"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-500">
                        <div className="space-y-1 text-sm">
                          <div>设备 {item._count.devices}</div>
                          <div>会话 {item._count.authSessions}</div>
                          <div>挑战 {item._count.qrChallenges}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        {item.lastLoginIp || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        {formatDate(item.lastLoginAt || item.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            asChild
                            variant="outline"
                            className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                          >
                            <Link href={`/dashboard/admin/users/${item.id}`}>
                              查看详情
                              <ArrowRight size={15} />
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-red-200 bg-white text-red-600 hover:bg-red-50"
                            onClick={() => setSuspendTarget(item)}
                          >
                            <Ban size={14} />
                            {item.status === "SUSPENDED" ? "解封" : "封禁"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-red-200 bg-white text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 size={14} />
                            删除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {data?.pagination ? (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-zinc-500">
            共 {data.pagination.total} 条记录，第 {data.pagination.page} / {data.pagination.totalPages} 页
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={data.pagination.page <= 1 || loading}
              className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              onClick={() => {
                const nextPage = Math.max(1, data.pagination.page - 1);
                setPage(nextPage);
                void loadUsers(query, nextPage, pageSize, sortBy);
              }}
            >
              上一页
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={data.pagination.page >= data.pagination.totalPages || loading}
              className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              onClick={() => {
                const nextPage = Math.min(data.pagination.totalPages, data.pagination.page + 1);
                setPage(nextPage);
                void loadUsers(query, nextPage, pageSize, sortBy);
              }}
            >
              下一页
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog
        open={!!suspendTarget}
        onOpenChange={(open) => {
          if (!open) setSuspendTarget(null);
        }}
      >
        <DialogContent className="border-zinc-200 bg-white shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-900">更新用户状态</DialogTitle>
            <DialogDescription className="text-zinc-500">
              你将{ suspendTarget?.status === "SUSPENDED" ? "解封" : "封禁" }用户“{suspendTarget?.displayName || suspendTarget?.wechatNickname || suspendTarget?.name || suspendTarget?.email || ""}”。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSuspendTarget(null)}
              className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            >
              取消
            </Button>
            <Button
              type="button"
              disabled={mutating}
              onClick={() => void handleSuspendUser()}
              className="border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            >
              {mutating ? "处理中..." : suspendTarget?.status === "SUSPENDED" ? "确认解封" : "确认封禁"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="border-zinc-200 bg-white shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-900">删除用户</DialogTitle>
            <DialogDescription className="text-zinc-500">
              你将删除用户“{deleteTarget?.displayName || deleteTarget?.wechatNickname || deleteTarget?.name || deleteTarget?.email || ""}”。系统会将该用户状态标记为已删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            >
              取消
            </Button>
            <Button
              type="button"
              disabled={mutating}
              onClick={() => void handleDeleteUser()}
              className="border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            >
              {mutating ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">{label}</div>
        <div className="mt-3 text-3xl font-semibold text-zinc-900">{value}</div>
      </CardContent>
    </Card>
  );
}
