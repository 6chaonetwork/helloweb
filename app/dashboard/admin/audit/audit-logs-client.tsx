"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleAlert, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

const filterOptions: Array<{ value: AuditType; label: string }> = [
  { value: "ALL", label: "全部类型" },
  { value: "CONFIG_UPDATE", label: "配置变更" },
  { value: "AUTH", label: "用户登录 / 身份验证" },
  { value: "ANNOUNCE", label: "公告发布" },
  { value: "SYSTEM", label: "系统事件" },
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AuditItem[]>([]);

  const loadItems = useCallback(async (nextQuery = query, nextType = filterType) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/audit?q=${encodeURIComponent(nextQuery)}&type=${encodeURIComponent(nextType)}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as { items?: AuditItem[]; error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "加载审计日志失败");
      }

      setItems(payload.items || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载审计日志失败");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, query]);

  useEffect(() => {
    void loadItems("", "ALL");
  }, [loadItems]);

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
            onClick={() => void loadItems(query, filterType)}
            className="bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92"
          >
            <Search size={15} />
            搜索
          </Button>
        </div>

        <div className="w-full md:w-[260px]">
          <Select
            value={filterType}
            onValueChange={(value) => {
              const nextType = value as AuditType;
              setFilterType(nextType);
              void loadItems(query, nextType);
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-zinc-200 hover:bg-transparent">
                  <TableCell colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-500">
                    正在加载审计日志...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow className="border-zinc-200 hover:bg-transparent">
                  <TableCell colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-500">
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
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <CircleAlert className="mt-0.5 text-claw-red" size={18} />
        <p className="text-sm leading-7 text-zinc-500">
          当前审计面板优先覆盖配置变更、身份验证、公告发布与系统事件。后续可以继续扩展时间范围筛选、导出与异常告警联动。
        </p>
      </div>
    </div>
  );
}
