"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";

type AnnouncementItem = {
  id: string;
  category: string;
  title: string;
  content: string;
  summary: string | null;
  status: string;
  pinned: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type AnnouncementResponse = {
  items: AnnouncementItem[];
};

const statusOptions = ["ACTIVE", "DRAFT", "ARCHIVED"] as const;
const audienceOptions = ["全服用户", "特定活跃用户"] as const;

const defaultForm = {
  category: "官方公告",
  title: "",
  summary: "",
  content: "",
  status: "ACTIVE",
  pinned: false,
  sortOrder: 0,
  audience: "全服用户",
};

export function AnnouncementsAdminClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementItem | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/announcements", { cache: "no-store" });
      const payload = (await response.json()) as AnnouncementResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "加载公告失败");
      }
      setItems(payload.items || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载公告失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(defaultForm);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(
        editingId ? `/api/admin/announcements/${editingId}` : "/api/admin/announcements",
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: form.category,
            title: form.title,
            summary: form.summary,
            content: form.content,
            status: form.status,
            pinned: form.pinned,
            sortOrder: form.sortOrder,
          }),
        },
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "保存公告失败");
      }
      resetForm();
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "保存公告失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "删除公告失败");
      }
      if (editingId === id) {
        resetForm();
      }
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "删除公告失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <CardHeader>
          <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">
            {editingId ? "Edit" : "Create"}
          </Badge>
          <CardTitle className="text-zinc-900">{editingId ? "编辑公告" : "新增公告"}</CardTitle>
          <CardDescription className="text-zinc-500">
            管理公告的标题、摘要、正文、状态与触达范围。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <Input
              className="border-zinc-200 bg-white text-zinc-900"
              placeholder="分类"
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            />
            <Input
              className="border-zinc-200 bg-white text-zinc-900"
              placeholder="标题"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            />
            <Input
              className="border-zinc-200 bg-white text-zinc-900"
              placeholder="摘要"
              value={form.summary}
              onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
            />
            <Textarea
              className="min-h-[180px] border-zinc-200 bg-white text-zinc-900"
              placeholder="正文"
              value={form.content}
              onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                className="border-zinc-200 bg-white text-zinc-900"
                type="number"
                placeholder="排序"
                value={form.sortOrder}
                onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))}
              />
              <Select
                value={form.status}
                onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="border-zinc-200 bg-white text-zinc-900">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent className="border-zinc-200 bg-white text-zinc-900 shadow-sm">
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Select
                value={form.audience}
                onValueChange={(value) => setForm((prev) => ({ ...prev, audience: value }))}
              >
                <SelectTrigger className="border-zinc-200 bg-white text-zinc-900">
                  <SelectValue placeholder="触达范围" />
                </SelectTrigger>
                <SelectContent className="border-zinc-200 bg-white text-zinc-900 shadow-sm">
                  {audienceOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
                触达范围预留：{form.audience}
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, pinned: event.target.checked }))
                }
              />
              <span>置顶公告</span>
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={saving}
                className="bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92"
              >
                {saving ? "保存中..." : editingId ? "保存修改" : "发布公告"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              >
                重置
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <CardHeader>
          <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">Announcement List</Badge>
          <CardTitle className="text-zinc-900">公告列表</CardTitle>
          <CardDescription className="text-zinc-500">
            清晰查看状态、发布时间与预留的触达范围。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
              加载中...
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
              <Table>
                <TableHeader className="[&_tr]:border-zinc-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-zinc-500">公告标题</TableHead>
                    <TableHead className="text-zinc-500">状态</TableHead>
                    <TableHead className="text-zinc-500">发布时间</TableHead>
                    <TableHead className="text-zinc-500">触达范围</TableHead>
                    <TableHead className="text-right text-zinc-500">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="border-zinc-200 hover:bg-zinc-50">
                      <TableCell className="min-w-[300px]">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">
                              {item.category}
                            </Badge>
                            {item.pinned ? (
                              <Badge className="border-red-200 bg-red-50 text-claw-red">
                                置顶
                              </Badge>
                            ) : null}
                          </div>
                          <div className="text-sm font-semibold text-zinc-900">{item.title}</div>
                          {item.summary ? (
                            <div className="text-sm text-zinc-500">{item.summary}</div>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        {item.updatedAt.slice(0, 10)}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">全服用户</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                            onClick={() => {
                              setEditingId(item.id);
                              setForm({
                                category: item.category,
                                title: item.title,
                                summary: item.summary || "",
                                content: item.content,
                                status: item.status,
                                pinned: item.pinned,
                                sortOrder: item.sortOrder,
                                audience: "全服用户",
                              });
                            }}
                          >
                            编辑
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteTarget(item)}
                            className="border-red-200 bg-white text-red-600 hover:bg-red-50"
                          >
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

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="border-zinc-200 bg-white shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-900">删除公告</DialogTitle>
            <DialogDescription className="text-zinc-500">
              你将删除公告 “{deleteTarget?.title ?? ""}”。这个操作不可撤销。
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
              onClick={async () => {
                if (!deleteTarget) return;
                await handleDelete(deleteTarget.id);
                setDeleteTarget(null);
              }}
              className="border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
