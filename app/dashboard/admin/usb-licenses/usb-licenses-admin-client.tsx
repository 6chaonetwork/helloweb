"use client";

import { useCallback, useEffect, useState } from "react";
import { Ban, Check, Clock3, Search, X } from "lucide-react";
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

function matchText(value: string, query: string) {
  return value.toLowerCase().includes(query.trim().toLowerCase());
}

export function UsbLicensesAdminClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<UsbLicensesResponse | null>(null);
  const [approveTarget, setApproveTarget] = useState<UsbLicenseRequestItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<UsbLicenseRequestItem | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<UsbLicenseItem | null>(null);
  const [passwordForm, setPasswordForm] = useState("");
  const [approveForm, setApproveForm] = useState({
    customerName: "",
    notes: "",
    expiresAt: "",
  });
  const [reasonForm, setReasonForm] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/usb-licenses", { cache: "no-store" });
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
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function mutate(action: "approve" | "reject" | "revoke" | "set_password", payload: Record<string, unknown>) {
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
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "U 盘授权操作失败");
      throw mutationError;
    } finally {
      setSaving(false);
    }
  }

  const filteredRequests = (data?.requests || []).filter((item) => {
    if (!query.trim()) return true;
    const joined = [
      item.usbBindingId,
      item.driveLetter || "",
      item.volumeLabel || "",
      item.friendlyName || "",
      item.customerName || "",
      item.submitterName || "",
      item.status,
    ].join(" ");
    return matchText(joined, query);
  });

  const filteredLicenses = (data?.licenses || []).filter((item) => {
    if (!query.trim()) return true;
    const joined = [
      item.licenseId,
      item.usbBindingId,
      item.customerName || "",
      item.status,
      item.revokedReason || "",
    ].join(" ");
    return matchText(joined, query);
  });

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="待审批申请" value={String(data?.stats.pendingRequests ?? 0)} />
        <StatCard label="生效授权" value={String(data?.stats.activeLicenses ?? 0)} />
        <StatCard label="已停用授权" value={String(data?.stats.revokedLicenses ?? 0)} />
        <StatCard label="今日批准" value={String(data?.stats.approvedToday ?? 0)} />
      </div>

      <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <CardHeader>
          <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">Direct Issue Password</Badge>
          <CardTitle className="text-zinc-900">直签密码</CardTitle>
          <CardDescription className="text-zinc-500">
            设置后，客服工具输入这个密码即可直接下发授权，不再等待后台手动批准。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <div className="mb-2 text-sm text-zinc-500">
              当前状态：{data?.directIssue.passwordConfigured ? "已配置" : "未配置"}
              {data?.directIssue.updatedAt ? `，更新时间：${formatDateTime(data.directIssue.updatedAt)}` : ""}
            </div>
            <Input
              value={passwordForm}
              onChange={(event) => setPasswordForm(event.target.value)}
              placeholder="输入新的直签密码，至少 4 位"
              className="border-zinc-200 bg-white text-zinc-900"
              type="password"
            />
          </div>
          <Button
            type="button"
            disabled={saving || passwordForm.trim().length < 4}
            onClick={() => {
              void mutate("set_password", { password: passwordForm })
                .then(() => setPasswordForm(""))
                .catch(() => {});
            }}
            className="bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92"
          >
            保存直签密码
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-zinc-500">
            搜索 `usbBindingId`、盘符、卷标、客户名或授权号。
          </div>
          <div className="flex w-full gap-2 md:w-[420px]">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索 U 盘授权..."
              className="border-zinc-200 bg-white text-zinc-900"
            />
            <Button
              type="button"
              onClick={() => void loadData()}
              className="bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92"
            >
              <Search size={15} />
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

      <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <CardHeader>
          <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">Pending Requests</Badge>
          <CardTitle className="text-zinc-900">授权申请</CardTitle>
          <CardDescription className="text-zinc-500">
            这里处理 U 盘申请。批准后，工具即可拉取 `license.json` 到 `Deployment` 目录。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
              正在加载授权申请...
            </div>
          ) : !filteredRequests.length ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
              暂无授权申请。
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
              <Table>
                <TableHeader className="[&_tr]:border-zinc-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-zinc-500">U 盘信息</TableHead>
                    <TableHead className="text-zinc-500">申请信息</TableHead>
                    <TableHead className="text-zinc-500">状态</TableHead>
                    <TableHead className="text-zinc-500">最近提交</TableHead>
                    <TableHead className="text-right text-zinc-500">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((item) => (
                    <TableRow key={item.id} className="border-zinc-200 hover:bg-zinc-50">
                      <TableCell className="min-w-[280px] text-zinc-900">
                        <div className="space-y-1.5 text-sm">
                          <div className="font-semibold text-zinc-900">{item.friendlyName || item.volumeLabel || item.usbBindingId.slice(0, 12)}</div>
                          <div className="font-mono text-xs text-zinc-500">{item.usbBindingId}</div>
                          <div className="text-xs text-zinc-500">
                            {item.driveLetter || "-"} / {item.volumeLabel || "-"} / {item.devicePlatform || "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[220px] text-sm text-zinc-500">
                        <div>{item.customerName || "未填写客户名"}</div>
                        <div className="mt-1">{item.submitterName || "匿名提交"}</div>
                        <div className="mt-1 text-xs text-zinc-400">{item.applicantNote || "无备注"}</div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        {formatDateTime(item.lastSubmittedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50"
                            disabled={saving || item.status === "APPROVED"}
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
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <CardHeader>
          <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">Issued Licenses</Badge>
          <CardTitle className="text-zinc-900">已签发授权</CardTitle>
          <CardDescription className="text-zinc-500">
            本地程序会读取这里签发的离线授权，并在联机时同步停用策略。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
              正在加载已签发授权...
            </div>
          ) : !filteredLicenses.length ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
              暂无已签发授权。
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
              <Table>
                <TableHeader className="[&_tr]:border-zinc-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-zinc-500">授权</TableHead>
                    <TableHead className="text-zinc-500">客户 / 备注</TableHead>
                    <TableHead className="text-zinc-500">状态</TableHead>
                    <TableHead className="text-zinc-500">签发 / 停用</TableHead>
                    <TableHead className="text-right text-zinc-500">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLicenses.map((item) => (
                    <TableRow key={item.id} className="border-zinc-200 hover:bg-zinc-50">
                      <TableCell className="min-w-[320px] text-zinc-900">
                        <div className="space-y-1.5">
                          <div className="font-semibold text-zinc-900">{item.customerName || "未命名客户"}</div>
                          <div className="font-mono text-xs text-zinc-500">{item.licenseId}</div>
                          <div className="font-mono text-xs text-zinc-400">{item.usbBindingId}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        <div>{item.notes || "无备注"}</div>
                        <div className="mt-1 text-xs text-zinc-400">Policy v{item.policyVersion}</div>
                      </TableCell>
                      <TableCell>
                        <LicenseStatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        <div>{formatDateTime(item.issuedAt)}</div>
                        <div className="mt-1 text-xs text-zinc-400">
                          {item.revokedAt ? `停用：${formatDateTime(item.revokedAt)}` : `到期：${formatDateTime(item.expiresAt)}`}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-red-200 bg-white text-red-600 hover:bg-red-50"
                          disabled={saving || item.status !== "ACTIVE"}
                          onClick={() => {
                            setRevokeTarget(item);
                            setReasonForm(item.revokedReason || "");
                          }}
                        >
                          <Ban size={14} />
                          停用
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!approveTarget} onOpenChange={(open) => !open && setApproveTarget(null)}>
        <DialogContent className="border-zinc-200 bg-white shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-900">批准 U 盘授权</DialogTitle>
            <DialogDescription className="text-zinc-500">
              批准后，授权工具即可下载签名后的 `license.json`。
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
              停用后，客户端下次联机同步策略即会失效，并在本地缓存停用状态。
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

function StatusBadge({ status }: { status: UsbLicenseRequestItem["status"] }) {
  if (status === "APPROVED") {
    return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-600">已批准</Badge>;
  }
  if (status === "REJECTED") {
    return <Badge className="border-red-200 bg-red-50 text-red-600">已拒绝</Badge>;
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
    return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-600">生效中</Badge>;
  }
  if (status === "REVOKED") {
    return <Badge className="border-red-200 bg-red-50 text-red-600">已停用</Badge>;
  }
  return <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">已替换</Badge>;
}
