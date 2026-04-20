"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleAlert, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AuditType = "ALL" | "CONFIG_UPDATE" | "AUTH" | "ANNOUNCE" | "SYSTEM";

type AuditItem = {
  id: string;
  createdAt: string;
  action: string;
  eventType: Exclude<AuditType, "ALL">;
  actor: string;
  userId?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  detailsText: string;
  metadataJson?: unknown;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const filterOptions: Array<{ value: AuditType; label: string }> = [
  { value: "ALL", label: "全部类型" },
  { value: "CONFIG_UPDATE", label: "配置变更" },
  { value: "AUTH", label: "用户登录 / 身份验证" },
  { value: "ANNOUNCE", label: "公告发布" },
  { value: "SYSTEM", label: "系统事件" },
];

const pageSizeOptions = [
  { value: "20", label: "20 条 / 页" },
  { value: "50", label: "50 条 / 页" },
  { value: "100", label: "100 条 / 页" },
];

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function eventTone(type: Exclude<AuditType, "ALL">) {
  switch (type) {
    case "CONFIG_UPDATE":
      return {
        dot: "bg-claw-red",
        badge: "border-red-200 bg-red-50 text-red-600",
        label: "配置变更",
      };
    case "AUTH":
      return {
        dot: "bg-zinc-400",
        badge: "border-zinc-200 bg-zinc-50 text-zinc-600",
        label: "身份验证",
      };
    case "ANNOUNCE":
      return {
        dot: "bg-orange-500",
        badge: "border-orange-200 bg-orange-50 text-orange-600",
        label: "公告发布",
      };
    default:
      return {
        dot: "bg-zinc-500",
        badge: "border-zinc-200 bg-zinc-50 text-zinc-600",
        label: "系统事件",
      };
  }
}

export function AuditLogsClient() {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<AuditType>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AuditItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [deleteTarget, setDeleteTarget] = useState<AuditItem | null>(null);
  const [clearMode, setClearMode] = useState<"filtered" | "all" | null>(null);

  const loadItems = useCallback(async (
    nextQuery = query,
    nextType = filterType,
    nextPage = page,
    nextLimit = pageSize,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/audit?q=${encodeURIComponent(nextQuery)}&type=${encodeURIComponent(nextType)}&page=${nextPage}&limit=${nextLimit}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as {
        items?: AuditItem[];
        pagination?: Pagination;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "加载审计日志失败");
      }

      setItems(payload.items || []);
      setPagination(payload.pagination || {
        total: 0,
        page: nextPage,
        limit: nextLimit,
        totalPages: 1,
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载审计日志失败");
      setItems([]);
      setPagination((current) => ({ ...current, total: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  }, [filterType, page, pageSize, query]);

  useEffect(() => {
    void loadItems("", "ALL", 1, 20);
  }, [loadItems]);

  async function handleDeleteItem() {
    if (!deleteTarget) return;
    setMutating(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/audit/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "删除审计记录失败");
      }

      setDeleteTarget(null);
      await loadItems(query, filterType, page, pageSize);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "删除审计记录失败");
    } finally {
      setMutating(false);
    }
  }

  async function handleClearLogs() {
    if (!clearMode) return;
    setMutating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/audit", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scope: clearMode,
          q: query,
          type: filterType,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "清空审计日志失败");
      }

      setClearMode(null);
      setPage(1);
      await loadItems(query, filterType, 1, pageSize);
    } catch (clearError) {
      setError(clearError instanceof Error ? clearError.message : "清空审计日志失败");
    } finally {
      setMutating(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="检索动作、操作者或对象..."
            className="border-zinc-200 bg-white text-zinc-900"
          />
          <Button
            type="button"
            onClick={() => {
              setPage(1);
              void loadItems(query, filterType, 1, pageSize);
            }}
            className="bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92"
          >
            <Search size={15} />
            搜索
          </Button>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <div className="w-full md:w-[220px]">
            <Select
              value={filterType}
              onValueChange={(value) => {
                const nextType = value as AuditType;
                setFilterType(nextType);
                setPage(1);
                void loadItems(query, nextType, 1, pageSize);
              }}
            >
              <SelectTrigger className="border-zinc-200 bg-white text-zinc-900">
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent className="border-zinc-200 bg-white text-zinc-900 shadow-sm">
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
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
                void loadItems(query, filterType, 1, nextLimit);
              }}
            >
              <SelectTrigger className="border-zinc-200 bg-white text-zinc-900">
                <SelectValue placeholder="每页条数" />
              </SelectTrigger>
              <SelectContent className="border-zinc-200 bg-white text-zinc-900 shadow-sm">
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setClearMode("filtered")}
            className="border-red-200 bg-white text-red-600 hover:bg-red-50"
          >
            清空筛选结果
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setClearMode("all")}
            className="border-red-200 bg-white text-red-600 hover:bg-red-50"
          >
            清空全部
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="[&_tr]:border-zinc-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-zinc-500">时间</TableHead>
                <TableHead className="text-zinc-500">动作 / 事件</TableHead>
                <TableHead className="text-zinc-500">操作者</TableHead>
                <TableHead className="text-zinc-500">操作对象</TableHead>
                <TableHead className="text-zinc-500">详情 / 载荷</TableHead>
                <TableHead className="text-right text-zinc-500">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-zinc-200 hover:bg-transparent">
                  <TableCell colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-500">
                    正在加载审计日志...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow className="border-zinc-200 hover:bg-transparent">
                  <TableCell colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-500">
                    没有匹配的审计记录
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const tone = eventTone(item.eventType);
                  return (
                    <TableRow key={item.id} className="border-zinc-200 hover:bg-zinc-50">
                      <TableCell className="min-w-[170px] text-sm text-zinc-500">
                        {formatDateTime(item.createdAt)}
                      </TableCell>
                      <TableCell className="min-w-[240px]">
                        <div className="flex items-start gap-3">
                          <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${tone.dot}`} />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-zinc-900">{item.action}</div>
                            <div className="mt-2">
                              <Badge className={tone.badge}>{tone.label}</Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[180px] text-sm text-zinc-900">
                        {item.actor}
                      </TableCell>
                      <TableCell className="min-w-[220px] text-sm text-zinc-500">
                        {item.targetType || "System"}
                        {item.targetId ? (
                          <div className="mt-1 break-all text-xs text-zinc-400">{item.targetId}</div>
                        ) : null}
                      </TableCell>
                      <TableCell className="min-w-[320px]">
                        {item.detailsText ? (
                          <details className="group">
                            <summary className="cursor-pointer list-none text-sm text-zinc-500">
                              <span className="line-clamp-2 break-all group-open:hidden">
                                {item.detailsText}
                              </span>
                              <span className="hidden text-claw-red group-open:inline">
                                收起详情
                              </span>
                            </summary>
                            <pre className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs leading-6 text-zinc-700">
                              {item.detailsText}
                            </pre>
                          </details>
                        ) : (
                          <span className="text-sm text-zinc-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-red-200 bg-white text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteTarget(item)}
                        >
                          <Trash2 size={14} />
                          删除
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-zinc-500">
          共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={pagination.page <= 1 || loading}
            className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            onClick={() => {
              const nextPage = Math.max(1, pagination.page - 1);
              setPage(nextPage);
              void loadItems(query, filterType, nextPage, pageSize);
            }}
          >
            上一页
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pagination.page >= pagination.totalPages || loading}
            className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            onClick={() => {
              const nextPage = Math.min(pagination.totalPages, pagination.page + 1);
              setPage(nextPage);
              void loadItems(query, filterType, nextPage, pageSize);
            }}
          >
            下一页
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <CircleAlert className="mt-0.5 text-claw-red" size={18} />
        <p className="text-sm leading-7 text-zinc-500">
          当前审计面板优先覆盖配置变更、身份验证、公告发布与系统事件。后续可以继续扩展时间范围筛选、导出与异常告警联动。
        </p>
      </div>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="border-zinc-200 bg-white shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-900">删除审计记录</DialogTitle>
            <DialogDescription className="text-zinc-500">
              你将删除这条审计记录。这个操作不可撤销。
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
              onClick={() => void handleDeleteItem()}
              className="border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            >
              {mutating ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!clearMode}
        onOpenChange={(open) => {
          if (!open) setClearMode(null);
        }}
      >
        <DialogContent className="border-zinc-200 bg-white shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-900">清空审计日志</DialogTitle>
            <DialogDescription className="text-zinc-500">
              {clearMode === "filtered"
                ? "你将清空当前筛选结果对应的审计记录。这个操作不可撤销。"
                : "你将清空全部审计日志。这个操作不可撤销。"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setClearMode(null)}
              className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            >
              取消
            </Button>
            <Button
              type="button"
              disabled={mutating}
              onClick={() => void handleClearLogs()}
              className="border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            >
              {mutating ? "清空中..." : "确认清空"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
