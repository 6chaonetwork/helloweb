"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Ban,
  Check,
  Clock3,
  KeyRound,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldOff,
  X,
} from "lucide-react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type UsbLicenseRequestItem = {
  id: string;
  usbBindingId: string;
  driveLetter: string | null;
  volumeLabel: string | null;
  friendlyName: string | null;
  devicePlatform: string | null;
  customerName: string | null;
  submitterName: string | null;
  applicantNote: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  lastSubmittedAt: string;
  createdAt: string;
  updatedAt: string;
  licenseRecordId: string | null;
};

type UsbLicenseItem = {
  id: string;
  licenseId: string;
  requestId: string | null;
  usbBindingId: string;
  status: "ACTIVE" | "REVOKED" | "REPLACED";
  customerName: string | null;
  notes: string | null;
  issuedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  revokedReason: string | null;
  policyVersion: number;
  createdAt: string;
  updatedAt: string;
};

type UsbLicensesResponse = {
  stats: {
    pendingRequests: number;
    activeLicenses: number;
    revokedLicenses: number;
    approvedToday: number;
  };
  directIssue: {
    passwordConfigured: boolean;
    updatedAt: string | null;
  };
  query: string;
  pagination: {
    pageSize: number;
    requests: {
      page: number;
      total: number;
      totalPages: number;
    };
    licenses: {
      page: number;
      total: number;
      totalPages: number;
    };
  };
  requests: UsbLicenseRequestItem[];
  licenses: UsbLicenseItem[];
};

function formatDateTime(value?: string | null) {
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

export function UsbLicensesAdminClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [requestsPage, setRequestsPage] = useState(1);
  const [licensesPage, setLicensesPage] = useState(1);
  const [data, setData] = useState<UsbLicensesResponse | null>(null);

  const [passwordForm, setPasswordForm] = useState("");
  const [approveTarget, setApproveTarget] = useState<UsbLicenseRequestItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<UsbLicenseRequestItem | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<UsbLicenseItem | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<UsbLicenseItem | null>(null);
  const [approveForm, setApproveForm] = useState({
    customerName: "",
    notes: "",
    expiresAt: "",
  });
  const [reasonForm, setReasonForm] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      q: query,
      requestsPage: String(requestsPage),
      licensesPage: String(licensesPage),
      pageSize: "10",
    });

    try {
      const response = await fetch(`/api/admin/usb-licenses?${params.toString()}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as UsbLicensesResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "加载 U 盘授权失败");
      }
      setData(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载 U 盘授权失败");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [licensesPage, query, requestsPage]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function mutate(
    action: "approve" | "reject" | "revoke" | "set_password" | "reactivate",
    payload: Record<string, unknown>,
  ) {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/usb-licenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          ...payload,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "U 盘授权操作失败");
      }
      await loadData();
      return result;
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "U 盘授权操作失败");
      throw mutationError;
    } finally {
      setSaving(false);
    }
  }

  const requestPagination = data?.pagination.requests;
  const licensePagination = data?.pagination.licenses;

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden rounded-[28px] border-zinc-200 bg-[radial-gradient(circle_at_top_left,rgba(230,0,0,0.08),transparent_30%),linear-gradient(180deg,#ffffff,#fbfbfb)] shadow-sm">
          <CardContent className="p-6 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-claw-red">
                  USB License Control
                </div>
                <h2 className="text-3xl font-semibold tracking-[-0.04em] text-zinc-900">
                  正式可运营的 U 盘授权后台
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500">
                  待审批申请与已签发授权分开管理。支持直签密码、停用、恢复启用，以及后续客户规模扩大后的分页检索。
                </p>
              </div>
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-red-100 bg-red-50 text-claw-red shadow-[0_14px_30px_rgba(230,0,0,0.08)]">
                <ShieldCheck size={22} />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="待审批申请" value={String(data?.stats.pendingRequests ?? 0)} tone="amber" />
              <StatCard label="生效授权" value={String(data?.stats.activeLicenses ?? 0)} tone="emerald" />
              <StatCard label="已停用授权" value={String(data?.stats.revokedLicenses ?? 0)} tone="rose" />
              <StatCard label="今日批准" value={String(data?.stats.approvedToday ?? 0)} tone="slate" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-zinc-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">Direct Issue</Badge>
                <CardTitle className="mt-3 text-zinc-900">直签密码管理</CardTitle>
                <CardDescription className="mt-2 text-zinc-500">
                  客服工具输入这个密码后即可直接下发授权，不再等待后台手动批准。
                </CardDescription>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-500">
                <KeyRound size={18} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">当前状态</div>
              <div className="mt-3 flex items-center gap-3">
                {data?.directIssue.passwordConfigured ? (
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-600">已配置</Badge>
                ) : (
                  <Badge className="border-amber-200 bg-amber-50 text-amber-700">未配置</Badge>
                )}
                <span className="text-sm text-zinc-500">
                  {data?.directIssue.updatedAt ? `更新时间：${formatDateTime(data.directIssue.updatedAt)}` : "尚未设置直签密码"}
                </span>
              </div>
            </div>

            <Input
              value={passwordForm}
              onChange={(event) => setPasswordForm(event.target.value)}
              placeholder="输入新的直签密码，至少 4 位"
              className="h-12 rounded-2xl border-zinc-200 bg-white text-zinc-900"
              type="password"
            />

            <Button
              type="button"
              disabled={saving || passwordForm.trim().length < 4}
              onClick={() => {
                void mutate("set_password", { password: passwordForm })
                  .then(() => setPasswordForm(""))
                  .catch(() => {});
              }}
              className="h-12 w-full rounded-2xl bg-claw-red text-white shadow-[0_12px_24px_rgba(230,0,0,0.18)] hover:bg-claw-red/92"
            >
              {saving ? "保存中..." : "保存直签密码"}
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-[24px] border-zinc-200 bg-white shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-medium text-zinc-900">全局搜索</div>
            <div className="mt-1 text-sm text-zinc-500">
              搜索 `usbBindingId`、盘符、卷标、客户名、提交人或授权号。
            </div>
          </div>
          <div className="flex w-full gap-2 md:w-[520px]">
            <Input
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
              placeholder="搜索 U 盘授权..."
              className="h-12 rounded-2xl border-zinc-200 bg-white text-zinc-900"
            />
            <Button
              type="button"
              onClick={() => {
                setQuery(queryInput.trim());
                setRequestsPage(1);
                setLicensesPage(1);
              }}
              className="h-12 rounded-2xl bg-claw-red px-5 text-white shadow-[0_12px_24px_rgba(230,0,0,0.18)] hover:bg-claw-red/92"
            >
              <Search size={16} />
              搜索
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setQueryInput("");
                setQuery("");
                setRequestsPage(1);
                setLicensesPage(1);
                void loadData();
              }}
              className="h-12 rounded-2xl border-zinc-200 bg-white px-4 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            >
              <RefreshCw size={16} />
              刷新
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6">
        <DataSectionHeader
          badge="Pending Requests"
          title="待审批申请"
          description="这里只显示仍然待处理的申请。已经批准或拒绝的记录不会再混进这个列表。"
          count={requestPagination?.total ?? 0}
        />

        <Card className="rounded-[28px] border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <EmptyState text="正在加载待审批申请..." />
            ) : !data?.requests.length ? (
              <EmptyState text={query ? "没有匹配的待审批申请。" : "当前没有待审批申请。"} />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="[&_tr]:border-zinc-200">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-6 text-zinc-500">U 盘信息</TableHead>
                        <TableHead className="text-zinc-500">申请信息</TableHead>
                        <TableHead className="text-zinc-500">状态</TableHead>
                        <TableHead className="text-zinc-500">最近提交</TableHead>
                        <TableHead className="pr-6 text-right text-zinc-500">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.requests.map((item) => (
                        <TableRow key={item.id} className="border-zinc-200 hover:bg-zinc-50">
                          <TableCell className="min-w-[340px] pl-6 align-top">
                            <div className="space-y-1.5">
                              <div className="text-sm font-semibold text-zinc-900">
                                {item.friendlyName || item.volumeLabel || item.usbBindingId.slice(0, 18)}
                              </div>
                              <div className="font-mono text-xs text-zinc-500">{item.usbBindingId}</div>
                              <div className="text-xs text-zinc-400">
                                {item.driveLetter || "-"} / {item.volumeLabel || "-"} / {item.devicePlatform || "-"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[260px] align-top">
                            <div className="space-y-1 text-sm text-zinc-500">
                              <div>{item.customerName || "未填写客户名"}</div>
                              <div>{item.submitterName || "匿名提交"}</div>
                              <div className="text-xs text-zinc-400">{item.applicantNote || "无备注"}</div>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <StatusBadge status={item.status} />
                          </TableCell>
                          <TableCell className="align-top text-sm text-zinc-500">
                            {formatDateTime(item.lastSubmittedAt)}
                          </TableCell>
                          <TableCell className="pr-6 text-right align-top">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50"
                                disabled={saving}
                                onClick={() => {
                                  setApproveTarget(item);
                                  setApproveForm({
                                    customerName: item.customerName || "",
                                    notes: "",
                                    expiresAt: "",
                                  });
                                }}
                              >
                                <Check size={14} />
                                批准
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="border-red-200 bg-white text-red-600 hover:bg-red-50"
                                disabled={saving}
                                onClick={() => {
                                  setRejectTarget(item);
                                  setReasonForm(item.rejectionReason || "");
                                }}
                              >
                                <X size={14} />
                                拒绝
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <PaginationBar
                  page={requestPagination?.page ?? 1}
                  totalPages={requestPagination?.totalPages ?? 1}
                  total={requestPagination?.total ?? 0}
                  onPrevious={() => setRequestsPage((current) => Math.max(1, current - 1))}
                  onNext={() =>
                    setRequestsPage((current) => Math.min(requestPagination?.totalPages ?? current, current + 1))
                  }
                />
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6">
        <DataSectionHeader
          badge="Issued Licenses"
          title="已签发授权"
          description="这里集中处理停用与恢复启用。恢复后，客户端下次联网启动会重新变为可用。"
          count={licensePagination?.total ?? 0}
        />

        <Card className="rounded-[28px] border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <EmptyState text="正在加载已签发授权..." />
            ) : !data?.licenses.length ? (
              <EmptyState text={query ? "没有匹配的已签发授权。" : "当前没有已签发授权。"} />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="[&_tr]:border-zinc-200">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-6 text-zinc-500">授权</TableHead>
                        <TableHead className="text-zinc-500">客户 / 备注</TableHead>
                        <TableHead className="text-zinc-500">状态</TableHead>
                        <TableHead className="text-zinc-500">签发 / 停用</TableHead>
                        <TableHead className="pr-6 text-right text-zinc-500">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.licenses.map((item) => (
                        <TableRow key={item.id} className="border-zinc-200 hover:bg-zinc-50">
                          <TableCell className="min-w-[360px] pl-6 align-top">
                            <div className="space-y-1.5">
                              <div className="text-sm font-semibold text-zinc-900">{item.customerName || "未命名客户"}</div>
                              <div className="font-mono text-xs text-zinc-500">{item.licenseId}</div>
                              <div className="font-mono text-xs text-zinc-400">{item.usbBindingId}</div>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[220px] align-top text-sm text-zinc-500">
                            <div>{item.notes || "无备注"}</div>
                            <div className="mt-1 text-xs text-zinc-400">Policy v{item.policyVersion}</div>
                            {item.revokedReason ? (
                              <div className="mt-2 text-xs text-rose-500">{item.revokedReason}</div>
                            ) : null}
                          </TableCell>
                          <TableCell className="align-top">
                            <LicenseStatusBadge status={item.status} />
                          </TableCell>
                          <TableCell className="align-top text-sm text-zinc-500">
                            <div>签发：{formatDateTime(item.issuedAt)}</div>
                            <div className="mt-1 text-xs text-zinc-400">
                              {item.revokedAt
                                ? `停用：${formatDateTime(item.revokedAt)}`
                                : item.expiresAt
                                  ? `到期：${formatDateTime(item.expiresAt)}`
                                  : "长期有效"}
                            </div>
                          </TableCell>
                          <TableCell className="pr-6 text-right align-top">
                            <div className="flex justify-end gap-2">
                              {item.status === "ACTIVE" ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="border-red-200 bg-white text-red-600 hover:bg-red-50"
                                  disabled={saving}
                                  onClick={() => {
                                    setRevokeTarget(item);
                                    setReasonForm(item.revokedReason || "");
                                  }}
                                >
                                  <ShieldOff size={14} />
                                  停用
                                </Button>
                              ) : item.status === "REVOKED" ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50"
                                  disabled={saving}
                                  onClick={() => setReactivateTarget(item)}
                                >
                                  <Power size={14} />
                                  恢复启用
                                </Button>
                              ) : (
                                <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
                                  已被替换
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <PaginationBar
                  page={licensePagination?.page ?? 1}
                  totalPages={licensePagination?.totalPages ?? 1}
                  total={licensePagination?.total ?? 0}
                  onPrevious={() => setLicensesPage((current) => Math.max(1, current - 1))}
                  onNext={() =>
                    setLicensesPage((current) => Math.min(licensePagination?.totalPages ?? current, current + 1))
                  }
                />
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <Dialog open={!!approveTarget} onOpenChange={(open) => !open && setApproveTarget(null)}>
        <DialogContent className="border-zinc-200 bg-white shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-900">批准 U 盘授权</DialogTitle>
            <DialogDescription className="text-zinc-500">
              批准后，客服工具即可拉取签名后的 `license.json`。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              value={approveForm.customerName}
              onChange={(event) => setApproveForm((prev) => ({ ...prev, customerName: event.target.value }))}
              placeholder="客户名"
              className="border-zinc-200 bg-white text-zinc-900"
            />
            <Input
              value={approveForm.expiresAt}
              onChange={(event) => setApproveForm((prev) => ({ ...prev, expiresAt: event.target.value }))}
              placeholder="到期时间，可留空，例如 2026-12-31T23:59:59Z"
              className="border-zinc-200 bg-white text-zinc-900"
            />
            <Input
              value={approveForm.notes}
              onChange={(event) => setApproveForm((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder="备注"
              className="border-zinc-200 bg-white text-zinc-900"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setApproveTarget(null)}
              className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            >
              取消
            </Button>
            <Button
              type="button"
              disabled={saving || !approveTarget}
              onClick={() => {
                if (!approveTarget) return;
                void mutate("approve", {
                  requestId: approveTarget.id,
                  customerName: approveForm.customerName,
                  notes: approveForm.notes,
                  expiresAt: approveForm.expiresAt,
                }).then(() => setApproveTarget(null)).catch(() => {});
              }}
              className="bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92"
            >
              {saving ? "批准中..." : "确认批准"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="border-zinc-200 bg-white shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-900">拒绝授权申请</DialogTitle>
            <DialogDescription className="text-zinc-500">
              被拒绝后，工具轮询会返回拒绝原因。
            </DialogDescription>
          </DialogHeader>
          <Input
            value={reasonForm}
            onChange={(event) => setReasonForm(event.target.value)}
            placeholder="拒绝原因"
            className="border-zinc-200 bg-white text-zinc-900"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectTarget(null)}
              className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            >
              取消
            </Button>
            <Button
              type="button"
              disabled={saving || !rejectTarget}
              onClick={() => {
                if (!rejectTarget) return;
                void mutate("reject", {
                  requestId: rejectTarget.id,
                  reason: reasonForm,
                }).then(() => setRejectTarget(null)).catch(() => {});
              }}
              className="border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            >
              {saving ? "处理中..." : "确认拒绝"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <DialogContent className="border-zinc-200 bg-white shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-900">停用 U 盘授权</DialogTitle>
            <DialogDescription className="text-zinc-500">
              客户端下次联网启动时会同步到停用状态，并在本地缓存后继续失效。
            </DialogDescription>
          </DialogHeader>
          <Input
            value={reasonForm}
            onChange={(event) => setReasonForm(event.target.value)}
            placeholder="停用原因"
            className="border-zinc-200 bg-white text-zinc-900"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRevokeTarget(null)}
              className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            >
              取消
            </Button>
            <Button
              type="button"
              disabled={saving || !revokeTarget}
              onClick={() => {
                if (!revokeTarget) return;
                void mutate("revoke", {
                  licenseId: revokeTarget.licenseId,
                  reason: reasonForm,
                }).then(() => setRevokeTarget(null)).catch(() => {});
              }}
              className="border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            >
              {saving ? "停用中..." : "确认停用"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!reactivateTarget} onOpenChange={(open) => !open && setReactivateTarget(null)}>
        <DialogContent className="border-zinc-200 bg-white shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-900">恢复启用 U 盘授权</DialogTitle>
            <DialogDescription className="text-zinc-500">
              恢复后，客户端下次联网启动时会同步回可用状态；之后离线也可继续使用。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReactivateTarget(null)}
              className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            >
              取消
            </Button>
            <Button
              type="button"
              disabled={saving || !reactivateTarget}
              onClick={() => {
                if (!reactivateTarget) return;
                void mutate("reactivate", {
                  licenseId: reactivateTarget.licenseId,
                }).then(() => setReactivateTarget(null)).catch(() => {});
              }}
              className="bg-emerald-600 text-white shadow-[0_10px_24px_rgba(5,150,105,0.18)] hover:bg-emerald-600/92"
            >
              {saving ? "恢复中..." : "确认恢复启用"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DataSectionHeader({
  badge,
  title,
  description,
  count,
}: {
  badge: string;
  title: string;
  description: string;
  count: number;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">{badge}</Badge>
        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-zinc-900">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-zinc-500">{description}</p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500 shadow-sm">
        当前共 <span className="font-semibold text-zinc-900">{count}</span> 条
      </div>
    </div>
  );
}

function PaginationBar({
  page,
  totalPages,
  total,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-zinc-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-zinc-500">
        第 <span className="font-semibold text-zinc-900">{page}</span> /{" "}
        <span className="font-semibold text-zinc-900">{totalPages}</span> 页，共{" "}
        <span className="font-semibold text-zinc-900">{total}</span> 条
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={page <= 1}
          className="rounded-xl border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
        >
          上一页
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onNext}
          disabled={page >= totalPages}
          className="rounded-xl border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
        >
          下一页
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[28px] px-6 py-16 text-center text-sm text-zinc-500">
      {text}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "amber" | "emerald" | "rose" | "slate";
}) {
  const toneClasses = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    slate: "border-zinc-200 bg-zinc-50 text-zinc-700",
  } as const;

  return (
    <div className={`rounded-2xl border px-4 py-4 ${toneClasses[tone]}`}>
      <div className="text-[11px] uppercase tracking-[0.2em]">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: UsbLicenseRequestItem["status"] }) {
  if (status === "APPROVED") {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-600">
        <Check size={12} />
        已批准
      </Badge>
    );
  }
  if (status === "REJECTED") {
    return (
      <Badge className="border-red-200 bg-red-50 text-red-600">
        <X size={12} />
        已拒绝
      </Badge>
    );
  }
  return (
    <Badge className="border-amber-200 bg-amber-50 text-amber-700">
      <Clock3 size={12} />
      待审批
    </Badge>
  );
}

function LicenseStatusBadge({ status }: { status: UsbLicenseItem["status"] }) {
  if (status === "ACTIVE") {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-600">
        <ShieldCheck size={12} />
        生效中
      </Badge>
    );
  }
  if (status === "REVOKED") {
    return (
      <Badge className="border-rose-200 bg-rose-50 text-rose-600">
        <Ban size={12} />
        已停用
      </Badge>
    );
  }
  return (
    <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">
      <KeyRound size={12} />
      已替换
    </Badge>
  );
}
