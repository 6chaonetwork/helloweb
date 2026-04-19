"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCog,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AdminAccount = {
  id: string;
  username: string;
  role: "SUPER_ADMIN" | "OPERATOR";
  lastLoginAt: string;
  status: "ACTIVE" | "DISABLED";
};

type SystemTabsClientProps = {
  environmentLabel: string;
  timezoneLabel: string;
  databaseHealthy: boolean;
};

export function SystemTabsClient({
  environmentLabel,
  timezoneLabel,
  databaseHealthy,
}: SystemTabsClientProps) {
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAccount | null>(null);
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "OPERATOR" as "SUPER_ADMIN" | "OPERATOR",
  });

  useEffect(() => {
    void loadAdmins("");
  }, []);

  async function loadAdmins(nextQuery = query) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/admins?q=${encodeURIComponent(nextQuery)}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as { items?: AdminAccount[]; error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "加载管理员账号失败");
      }

      setAdminAccounts(payload.items || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载管理员账号失败");
      setAdminAccounts([]);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      username: "",
      password: "",
      role: "OPERATOR",
    });
  }

  async function handleCreateAdmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "创建管理员失败");
      }

      setCreateOpen(false);
      resetForm();
      await loadAdmins();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "创建管理员失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateAdmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingAccount) return;
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/admins/${editingAccount.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "更新管理员失败");
      }

      setEditingAccount(null);
      resetForm();
      await loadAdmins();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "更新管理员失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(account: AdminAccount) {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/admins/${account.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: account.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "更新管理员状态失败");
      }

      await loadAdmins();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "更新管理员状态失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAdmin() {
    if (!deleteTarget) return;
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/admins/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "删除管理员失败");
      }

      setDeleteTarget(null);
      await loadAdmins();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "删除管理员失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Tabs defaultValue="accounts" className="gap-6">
      <TabsList className="h-auto w-full justify-start gap-8 rounded-none border-b border-zinc-200 bg-transparent p-0">
        <TabsTrigger
          value="accounts"
          className="rounded-none border-b-2 border-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-claw-red data-[state=active]:bg-transparent data-[state=active]:text-zinc-900 data-[state=active]:shadow-none"
        >
          管理员账号 (Admin Accounts)
        </TabsTrigger>
        <TabsTrigger
          value="health"
          className="rounded-none border-b-2 border-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-claw-red data-[state=active]:bg-transparent data-[state=active]:text-zinc-900 data-[state=active]:shadow-none"
        >
          系统状态 (System Health)
        </TabsTrigger>
      </TabsList>

      <TabsContent value="accounts" className="outline-none">
        <div className="grid gap-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-lg font-semibold text-zinc-900">管理员账号</h2>
                <p className="mt-1 text-sm leading-7 text-zinc-500">
                  统一维护后台管理入口与角色权限，支持搜索、禁用、删除和重置密码。
                </p>
              </div>
              <Button
                onClick={() => {
                  resetForm();
                  setCreateOpen(true);
                }}
                className="bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92"
              >
                添加管理员
              </Button>
            </div>

            <div className="mt-5 flex w-full gap-2 lg:max-w-[420px]">
                <Input
                  className="border-zinc-200 bg-white text-zinc-900"
                  placeholder="搜索账号或角色..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              <Button
                type="button"
                onClick={() => void loadAdmins(query)}
                className="bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92"
              >
                <Search size={15} />
                搜索
              </Button>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
              <table className="min-w-[1120px] w-full text-sm">
                <thead className="border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
                      用户名 / 邮箱
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
                      角色权限
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
                      最后登录时间
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
                      最近登录来源 / IP
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
                      状态
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-500">
                        正在加载管理员账号...
                      </td>
                    </tr>
                  ) : adminAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-500">
                        暂无管理员账号
                      </td>
                    </tr>
                  ) : (
                    adminAccounts.map((account) => (
                      <tr
                        key={account.id}
                        className="border-b border-zinc-200 last:border-b-0 hover:bg-zinc-50"
                      >
                        <td className="px-4 py-4 align-top">
                          <div className="text-sm font-medium text-zinc-900">{account.username}</div>
                          <div className="mt-1 text-xs text-zinc-500">{account.username}@local</div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <Badge
                            className={
                              account.role === "SUPER_ADMIN"
                                ? "border-red-200 bg-red-50 text-claw-red"
                                : "border-zinc-200 bg-zinc-50 text-zinc-600"
                            }
                          >
                            {account.role === "SUPER_ADMIN" ? "Super Admin" : "Operator"}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 align-top text-sm text-zinc-500">
                          {account.lastLoginAt}
                        </td>
                      <td className="px-4 py-4 align-top">
                        <Badge
                          className={
                              account.status === "ACTIVE"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                                : "border-red-200 bg-red-50 text-red-600"
                            }
                          >
                            {account.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-right align-top">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                              onClick={() => {
                                setEditingAccount(account);
                                setForm({
                                  username: account.username,
                                  password: "",
                                  role: account.role,
                                });
                              }}
                            >
                              编辑权限
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-200 bg-white text-red-600 hover:bg-red-50"
                              onClick={() => void handleToggleStatus(account)}
                            >
                              {account.status === "ACTIVE" ? "禁用" : "恢复"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-200 bg-white text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteTarget(account)}
                            >
                              <Trash2 size={14} />
                              删除
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-500">
                <UserCog size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">角色权限说明</h2>
                <p className="mt-1 text-sm leading-7 text-zinc-500">
                  明确不同后台管理员的权限边界，避免误操作和越权访问。
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-claw-red" />
                  <div className="text-sm font-semibold text-zinc-900">SUPER_ADMIN</div>
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-zinc-600">
                  <li>可访问全部后台模块与敏感配置。</li>
                  <li>可新增、禁用、删除管理员账号。</li>
                  <li>可查看审计与系统模块，并执行全局控制操作。</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-zinc-500" />
                  <div className="text-sm font-semibold text-zinc-900">OPERATOR</div>
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-zinc-600">
                  <li>可访问总览、用户与身份、内容运营。</li>
                  <li>不可访问渠道与接入、审计与日志、系统与权限。</li>
                  <li>不可修改其他管理员账号或全局系统策略。</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="health" className="outline-none">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">环境参数</h2>
            <p className="mt-1 text-sm leading-7 text-zinc-500">
              当前控制台运行环境与系统时区等基础参数。
            </p>

            <div className="mt-6 grid gap-3">
              <InfoRow label="运行环境" value={environmentLabel} />
              <InfoRow label="系统时区" value={timezoneLabel} />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">基础设施状态</h2>
            <p className="mt-1 text-sm leading-7 text-zinc-500">
              当前控制台依赖的核心基础设施健康度。
            </p>

            <div className="mt-6 grid gap-3">
              <InfoRow
                label="数据库连接"
                value={databaseHealthy ? "健康" : "异常"}
                dotClassName={databaseHealthy ? "bg-emerald-500" : "bg-red-500"}
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-red-200 bg-red-50 text-red-600">
                <ShieldAlert size={18} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-zinc-900">全局维护模式</h2>
                <p className="mt-1 text-sm leading-7 text-zinc-500">
                  当开启维护模式时，全站和桌面端相关 API 将进入受限状态并提示系统升级中。当前阶段先实现 UI 交互。
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-medium text-zinc-900">
                  {maintenanceEnabled ? "维护模式已开启" : "维护模式已关闭"}
                </div>
                <div className="mt-1 text-sm text-zinc-500">
                  仅为控制台预演开关，当前不会真正拦截接口请求。
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMaintenanceEnabled((current) => !current)}
                className={`inline-flex min-w-[180px] items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition ${
                  maintenanceEnabled
                    ? "bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92"
                    : "border border-red-200 bg-white text-red-600 hover:bg-red-100"
                }`}
              >
                {maintenanceEnabled ? "关闭维护模式" : "开启维护模式"}
              </button>
            </div>
          </div>
        </div>
      </TabsContent>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="border-zinc-200 bg-white shadow-sm">
          <form onSubmit={handleCreateAdmin}>
            <DialogHeader>
              <DialogTitle className="text-zinc-900">添加管理员</DialogTitle>
              <DialogDescription className="text-zinc-500">
                创建新的后台管理员账号，并指定权限角色。
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 grid gap-4">
              <Input
                className="border-zinc-200 bg-white text-zinc-900"
                placeholder="管理员账号"
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              />
              <Input
                className="border-zinc-200 bg-white text-zinc-900"
                type="password"
                placeholder="初始密码"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              />
              <Select
                value={form.role}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    role: value as "SUPER_ADMIN" | "OPERATOR",
                  }))
                }
              >
                <SelectTrigger className="border-zinc-200 bg-white text-zinc-900">
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent className="border-zinc-200 bg-white text-zinc-900 shadow-sm">
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="OPERATOR">Operator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateOpen(false);
                  resetForm();
                }}
                className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92"
              >
                {saving ? "创建中..." : "创建管理员"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingAccount}
        onOpenChange={(open) => {
          if (!open) {
            setEditingAccount(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="border-zinc-200 bg-white shadow-sm">
          <form onSubmit={handleUpdateAdmin}>
            <DialogHeader>
              <DialogTitle className="text-zinc-900">编辑管理员权限</DialogTitle>
              <DialogDescription className="text-zinc-500">
                更新管理员角色，或为其重置登录密码。
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 grid gap-4">
              <Input
                className="border-zinc-200 bg-white text-zinc-900"
                placeholder="管理员账号"
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              />
              <Input
                className="border-zinc-200 bg-white text-zinc-900"
                type="password"
                placeholder="新密码（留空则不修改）"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              />
              <Select
                value={form.role}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    role: value as "SUPER_ADMIN" | "OPERATOR",
                  }))
                }
              >
                <SelectTrigger className="border-zinc-200 bg-white text-zinc-900">
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent className="border-zinc-200 bg-white text-zinc-900 shadow-sm">
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="OPERATOR">Operator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingAccount(null);
                  resetForm();
                }}
                className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92"
              >
                {saving ? "保存中..." : "保存修改"}
              </Button>
            </DialogFooter>
          </form>
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
            <DialogTitle className="text-zinc-900">删除管理员</DialogTitle>
            <DialogDescription className="text-zinc-500">
              你将永久删除管理员账号“{deleteTarget?.username ?? ""}”。此操作不可撤销。
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6">
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
              disabled={saving}
              onClick={() => void handleDeleteAdmin()}
              className="border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            >
              {saving ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}

function InfoRow({
  label,
  value,
  dotClassName,
}: {
  label: string;
  value: string;
  dotClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="inline-flex items-center gap-2">
        {dotClassName ? <span className={`h-2 w-2 rounded-full ${dotClassName}`} /> : null}
        <span className="text-sm font-medium text-zinc-900">{value}</span>
      </div>
    </div>
  );
}
